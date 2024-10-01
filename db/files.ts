import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"
import mammoth from "mammoth"
import { uploadFile } from "./storage/files"

export const getFileById = async (fileId: string, client = supabase) => {
  // if file_id is short, search by hashid field
  // otherwise, search by id field

  const { data: file, error } = await client
    .from("files")
    .select("*, file_items (*)")
    .eq("id", fileId)
    .single()

  if (!file) {
    throw new Error(error.message)
  }

  return file
}

export const getAllPublicHtmlFiles = async () => {
  const { data: files, error } = await supabase
    .from("files")
    .select("id, hashid, name, description, file_items (content)")
    .eq("type", "html")
    .eq("sharing", "public")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return files
}

export const getFileByHashId = async (hashId: string) => {
  const { data: file, error } = await supabase
    .from("files")
    .select("*, file_items (*)")
    .eq("hashid", hashId)
    .single()

  if (!file) {
    throw new Error(error.message)
  }

  return file
}

export const getFileWorkspacesByWorkspaceId = async (workspaceId: string) => {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select(
      `
      id,
      name,
      files (*)
    `
    )
    .eq("id", workspaceId)
    .single()

  if (!workspace) {
    throw new Error(error.message)
  }

  return workspace
}

export const getFileWorkspacesByFileId = async (fileId: string) => {
  const { data: file, error } = await supabase
    .from("files")
    .select(
      `
      id, 
      name, 
      workspaces (*)
    `
    )
    .eq("id", fileId)
    .single()

  if (!file) {
    throw new Error(error.message)
  }

  return file
}

export const createFileBasedOnExtension = async (
  file: File,
  fileRecord: TablesInsert<"files">,
  workspace_id: string,
  embeddingsProvider: "jina" | "openai" | "local"
) => {
  const fileExtension = file.name.split(".").pop()

  if (fileExtension === "docx") {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({
      arrayBuffer
    })

    return createDocXFile(
      result.value,
      file,
      fileRecord,
      workspace_id,
      embeddingsProvider
    )
  } else {
    return createFile(file, fileRecord, workspace_id, embeddingsProvider)
  }
}

// For non-docx files
export const createFile = async (
  file: File,
  fileRecord: TablesInsert<"files">,
  workspace_id: string,
  embeddingsProvider: "jina" | "openai" | "local"
) => {
  const { data: createdFile, error } = await supabase
    .from("files")
    .insert([fileRecord])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await createFileWorkspace({
    user_id: createdFile.user_id,
    file_id: createdFile.id,
    workspace_id
  })

  const filePath = await uploadFile(file, {
    name: createdFile.name,
    user_id: createdFile.user_id,
    file_id: createdFile.name
  })

  await updateFile(createdFile.id, {
    file_path: filePath
  })

  const formData = new FormData()
  formData.append("file", file)
  formData.append("file_id", createdFile.id)
  formData.append("embeddingsProvider", embeddingsProvider)

  const response = await fetch("/api/retrieval/process", {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    if (error) {
      throw new Error(error.message)
    }
  }

  return await getFileById(createdFile.id)
}

// // Handle docx files
export const createDocXFile = async (
  text: string,
  file: File,
  fileRecord: TablesInsert<"files">,
  workspace_id: string,
  embeddingsProvider: "jina" | "openai" | "local"
) => {
  const { data: createdFile, error } = await supabase
    .from("files")
    .insert([fileRecord])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await createFileWorkspace({
    user_id: createdFile.user_id,
    file_id: createdFile.id,
    workspace_id
  })

  const filePath = await uploadFile(file, {
    name: createdFile.name,
    user_id: createdFile.user_id,
    file_id: createdFile.name
  })

  await updateFile(createdFile.id, {
    file_path: filePath
  })

  const response = await fetch("/api/retrieval/process/docx", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: text,
      fileId: createdFile.id,
      embeddingsProvider,
      fileExtension: "docx"
    })
  })

  if (!response.ok) {
    await deleteFile(createdFile.id)
    const error = await response.json()
    throw new Error(error.message || "Failed to process file.")
  }

  const fetchedFile = await getFileById(createdFile.id)

  return fetchedFile
}

export const createFiles = async (
  files: TablesInsert<"files">[],
  workspace_id: string
) => {
  const { data: createdFiles, error } = await supabase
    .from("files")
    .insert(files)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  await createFileWorkspaces(
    createdFiles.map(file => ({
      user_id: file.user_id,
      file_id: file.id,
      workspace_id
    }))
  )

  return createdFiles
}

export const createFileWorkspace = async (
  item: {
    user_id: string
    file_id: string
    workspace_id: string
  },
  client = supabase
) => {
  const { data: createdFileWorkspace, error } = await client
    .from("file_workspaces")
    .insert([item])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdFileWorkspace
}

export const createFileWorkspaces = async (
  items: { user_id: string; file_id: string; workspace_id: string }[]
) => {
  const { data: createdFileWorkspaces, error } = await supabase
    .from("file_workspaces")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createdFileWorkspaces
}

export const updateFile = async (
  fileId: string,
  file: TablesUpdate<"files">,
  client = supabase
) => {
  const { data: updatedFile, error } = await client
    .from("files")
    .update(file)
    .eq("id", fileId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedFile
}

export const deleteFile = async (fileId: string) => {
  const { error } = await supabase.from("files").delete().eq("id", fileId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const deleteFileWorkspace = async (
  fileId: string,
  workspaceId: string
) => {
  const { error } = await supabase
    .from("file_workspaces")
    .delete()
    .eq("file_id", fileId)
    .eq("workspace_id", workspaceId)

  if (error) throw new Error(error.message)

  return true
}

export const copyFileAndFileItems = async (
  fileId: string,
  workspaceId: string,
  userId: string,
  client = supabase
) => {
  // Fetch the original file
  const originalFile = await getFileById(fileId, client)

  // Check if the file is public
  if (originalFile.sharing !== "public") {
    throw new Error("Cannot copy a non-public file")
  }

  // Prepare the new file record
  const newFileRecord: TablesInsert<"files"> = {
    name: `Copy of ${originalFile.name}`,
    type: originalFile.type,
    sharing: "private", // Set the new copy to private by default
    user_id: userId,
    description: originalFile.description,
    file_path: "",
    tokens: originalFile.tokens,
    size: originalFile.size
  }

  // Create the new file
  const { data: newFile, error: newFileError } = await client
    .from("files")
    .insert([newFileRecord])
    .select("*")
    .single()

  if (newFileError) {
    throw new Error(newFileError.message)
  }

  const newFileItems = originalFile.file_items.map(item => ({
    content: item.content,
    tokens: item.tokens,
    jina_embedding: item.jina_embedding,
    openai_embedding: item.openai_embedding,
    local_embedding: item.local_embedding,
    user_id: userId,
    sharing: "private",
    file_id: newFile.id
  }))

  const { data: insertedFileItems, error: insertError } = await client
    .from("file_items")
    .insert(newFileItems)
    .select("*")

  if (insertError) {
    throw new Error(insertError.message)
  }

  // Create file workspace association
  await createFileWorkspace(
    {
      user_id: userId,
      file_id: newFile.id,
      workspace_id: workspaceId
    },
    client
  )

  // If there's a file_path, we need to copy the actual file in storage
  if (originalFile.file_path) {
    const { data: fileData, error: downloadError } = await client.storage
      .from("files")
      .download(originalFile.file_path)

    if (downloadError) {
      console.error(downloadError)
      return { ...newFile, file_items: insertedFileItems }
      // throw new Error(downloadError.message)
    }

    const newFilePath = await uploadFile(
      fileData,
      {
        name: newFile.name,
        user_id: userId,
        file_id: newFile.id
      },
      client
    )

    await updateFile(
      newFile.id,
      {
        file_path: newFilePath
      },
      client
    )
  }

  return { ...newFile, file_items: insertedFileItems }
}
