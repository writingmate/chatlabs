// "use server";
//
// import { openapiToFunctions } from "@/lib/openapi-conversion";
// import { platformToolDefinitions, platformToolFunction } from "@/lib/platformTools/utils/platformToolsUtils";
// import { checkApiKey, getServerProfile, validateModelAndMessageCount } from "@/lib/server/server-chat-helpers";
// import { Json, Tables } from "@/supabase/types";
// import { ChatSettings } from "@/types";
// import { OpenAI } from "openai";
// import { createAI, getMutableAIState, render } from "ai/rsc";
// import { z } from "zod";
// import { LLM_LIST, LLM_LIST_MAP } from "@/lib/models/llm/llm-list";
//
// function getProviderClient(model: string, profile: Tables<"profiles">) {
//   const provider = LLM_LIST.find((llm) => llm.modelId === model)?.provider;
//
//   if (provider === "openai") {
//     checkApiKey(profile.openai_api_key, "OpenAI");
//
//     return new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY || "",
//       organization: process.env.OPENAI_ORGANIZATION_ID,
//     });
//   }
//
//   if (provider === "mistral") {
//     checkApiKey(profile.mistral_api_key, "Mistral");
//     return new OpenAI({ apiKey: profile.mistral_api_key || "", baseURL: "https://api.mistral.ai/v1" });
//   }
//
//   if (provider === "anthropic") {
//     checkApiKey(profile.anthropic_api_key, "Anthropic");
//     return new OpenAI({ apiKey: profile.anthropic_api_key || "", baseURL: "https://api.anthropic.com" });
//   }
//
//   throw new Error(`Provider not supported: ${provider}`);
// }
//
// async function submitUserMessage(userInput: string, chatSettings: ChatSettings, selectedTools: Tables<"tools">[]): Promise<Message> {
//
//
//   const aiState = getMutableAIState<typeof AI>();
//
//   // Update the AI state with the new user message.
//   aiState.update([
//     ...aiState.get(),
//     { role: "user", content: userInput },
//   ]);
//
//   const profile = await getServerProfile();
//   const client = getProviderClient(chatSettings.model, profile);
//
//   let allTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [];
//   let allRouteMaps = {};
//   let schemaDetails: {
//     title: string;
//     description: string;
//     url: string;
//     headers: Json;
//     routeMap: Record<string, string>;
//     requestInBodyMap: Record<string, boolean>;
//   }[] = [];
//
//   for (const selectedTool of selectedTools) {
//     try {
//       const convertedSchema = await openapiToFunctions(
//         JSON.parse(selectedTool.schema as string)
//       );
//       const tools = convertedSchema.functions || [];
//       allTools = allTools.concat(tools);
//
//       const routeMap = convertedSchema.routes.reduce(
//         (map: Record<string, string>, route) => {
//           map[route.path.replace(/{(\w+)}/g, ":$1")] = route.operationId;
//           return map;
//         },
//         {}
//       );
//
//       allRouteMaps = { ...allRouteMaps, ...routeMap };
//
//       const requestInBodyMap = convertedSchema.routes.reduce(
//         (previousValue: { [key: string]: boolean }, currentValue) => {
//           previousValue[currentValue.path] = !!currentValue.requestInBody;
//           return previousValue;
//         },
//         {}
//       );
//
//       schemaDetails.push({
//         title: convertedSchema.info.title,
//         description: convertedSchema.info.description,
//         url: convertedSchema.info.server,
//         headers: selectedTool.custom_headers,
//         routeMap,
//         requestInBodyMap,
//       });
//     } catch (error: any) {
//       console.error("Error converting schema", error);
//     }
//   }
//
//   const ui = render({
//     model: chatSettings.model,
//     provider: client,
//     messages: [
//       { role: "system", content: "You are a helpful assistant." },
//       ...aiState.get() as any,
//     ],
//     text: ({ content, done }: { content: string; done: boolean }) => {
//       if (done) {
//         aiState.done([
//           ...aiState.get(),
//           { role: "assistant", content },
//         ]);
//       }
//
//       return <p>{content}</p>;
//     },
//     tools: {
//       ...allTools.reduce((acc, tool) => {
//         acc[tool.function.name] = {
//           description: tool.function.description,
//           parameters: z.object(tool.function.parameters as any),
//           render: async function* (args: any) {
//             const functionName = tool.function.name;
//             const argumentsString = JSON.stringify(args);
//             const parsedArgs = JSON.parse(argumentsString);
//
//             const schemaDetail = schemaDetails.find((detail) =>
//               Object.values(detail.routeMap).includes(functionName)
//             );
//
//             if (!schemaDetail) {
//               throw new Error(`Function ${functionName} not found in any schema`);
//             }
//
//             if (schemaDetail.url === "local://executor") {
//               const toolFunction = platformToolFunction(functionName);
//               if (!toolFunction) {
//                 throw new Error(`Function ${functionName} not found`);
//               }
//
//               const data = await toolFunction(parsedArgs);
//
//               aiState.done([
//                 ...aiState.get(),
//                 {
//                   role: "function",
//                   name: functionName,
//                   content: JSON.stringify(data),
//                 },
//               ]);
//
//               yield <pre>{JSON.stringify(data, null, 2)}</pre>;
//               return;
//             }
//
//             const pathTemplate = Object.keys(schemaDetail.routeMap).find(
//               (key) => schemaDetail.routeMap[key] === functionName
//             );
//
//             if (!pathTemplate) {
//               throw new Error(`Path for function ${functionName} not found`);
//             }
//
//             const path = pathTemplate.replace(/:(\w+)/g, (_, paramName) => {
//               const value = parsedArgs.parameters[paramName];
//               if (!value) {
//                 throw new Error(
//                   `Parameter ${paramName} not found for function ${functionName}`
//                 );
//               }
//               return encodeURIComponent(value);
//             });
//
//             if (!path) {
//               throw new Error(`Path for function ${functionName} not found`);
//             }
//
//             const isRequestInBody = schemaDetail.requestInBodyMap[path];
//             let data = {};
//
//             if (isRequestInBody) {
//               let headers = {
//                 "Content-Type": "application/json",
//               };
//
//               const customHeaders = schemaDetail.headers;
//               if (customHeaders && typeof customHeaders === "string") {
//                 let parsedCustomHeaders = JSON.parse(customHeaders) as Record<
//                   string,
//                   string
//                 >;
//
//                 headers = {
//                   ...headers,
//                   ...parsedCustomHeaders,
//                 };
//               }
//
//               const fullUrl = schemaDetail.url + path;
//
//               const bodyContent = parsedArgs.requestBody || parsedArgs;
//
//               const requestInit = {
//                 method: "POST",
//                 headers,
//                 body: JSON.stringify(bodyContent),
//               };
//
//               const response = await fetch(fullUrl, requestInit);
//
//               if (!response.ok) {
//                 data = {
//                   error: response.statusText,
//                 };
//               } else {
//                 data = await response.json();
//               }
//             } else {
//               const queryParams = new URLSearchParams(
//                 parsedArgs.parameters
//               ).toString();
//               const fullUrl =
//                 schemaDetail.url + path + (queryParams ? "?" + queryParams : "");
//
//               let headers = {};
//
//               const customHeaders = schemaDetail.headers;
//               if (customHeaders && typeof customHeaders === "string") {
//                 headers = JSON.parse(customHeaders);
//               }
//
//               const response = await fetch(fullUrl, {
//                 method: "GET",
//                 headers: headers,
//               });
//
//               if (!response.ok) {
//                 console.error("Error:", response.statusText, response.status);
//                 data = {
//                   error: response.statusText,
//                 };
//               } else {
//                 data = await response.json();
//               }
//             }
//
//             aiState.done([
//               ...aiState.get(),
//               {
//                 role: "function",
//                 name: functionName,
//                 content: JSON.stringify(data),
//               },
//             ]);
//
//             yield <pre>{JSON.stringify(data, null, 2)}</pre>;
//           },
//         };
//         return acc;
//       }, {} as Record<string, any>),
//     },
//   });
//
//   return { id: Date.now(), display: ui };
// }
//
// type Message = {
//   id: number;
//   display: React.ReactNode;
// }
//
// const initialAIState: {
//   role: "user" | "assistant" | "system" | "function";
//   content: string;
//   id?: string;
//   name?: string;
// }[] = [];
//
// const initialUIState: { id: number; display: React.ReactNode; }[] = [];
//
// const actions = {
//   submitUserMessage
// }
//
// export const AI = createAI<
//   typeof initialAIState,
//   typeof initialUIState,
//   typeof actions>({
//   actions,
//   initialUIState,
//   initialAIState,
// });
