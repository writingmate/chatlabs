const Imap = require('imap');
const { ImapMessage, Box } = require('imap');
const { simpleParser, ParsedMail } = require('mailparser');
const nodemailer = require('nodemailer');
const OpenAI = require('openai');
const { Readable } = require('stream');
const { google } = require('googleapis');

// Set your OpenAI API key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Gmail credentials
const USERNAME = 'writingmateai@gmail.com';
const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID;
const REFRESH_TOKEN = process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET;

// Function to get access token
async function getAccessToken() {
    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN
    });

    const { token } = await oauth2Client.getAccessToken();
    return token;
}

async function connectToGmail(): Promise<Imap> {
    console.log('Connecting to Gmail...');
    const accessToken = await getAccessToken();

    return new Promise<Imap>((resolve, reject) => {
        const imap = new Imap({
            user: USERNAME,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            authTimeout: 3000,
            tlsOptions: { rejectUnauthorized: false },
            auth: {
                type: 'OAuth2',
                user: USERNAME,
                accessToken: accessToken,
            },
        });

        imap.once('ready', () => {
            console.log('Successfully connected to Gmail');
            resolve(imap);
        });

        imap.once('error', (err: Error) => {
            console.error('Error connecting to Gmail:', err);
            reject(err);
        });

        imap.connect();
    });
}

async function* fetchEmails(batchSize: number = 10): AsyncGenerator<number[], void, unknown> {
    console.log(`Fetching emails in batches of ${batchSize}...`);
    await new Promise<void>((resolve, reject) => {
        imap.openBox('INBOX', true, (err: Error | null) => {
            if (err) {
                console.error('Error opening inbox:', err);
                reject(err);
            } else {
                console.log('Inbox opened successfully');
                resolve();
            }
        });
    });

    const results = await new Promise<number[]>((resolve, reject) => {
        imap.search(['ALL'], (err: Error | null, results: number[]) => {
            if (err) {
                console.error('Error searching emails:', err);
                reject(err);
            } else {
                console.log(`Found ${results.length} emails in total`);
                resolve(results);
            }
        });
    });

    for (let i = 0; i < results.length; i += batchSize) {
        console.log(`Yielding batch ${i / batchSize + 1} of ${Math.ceil(results.length / batchSize)}`);
        yield results.slice(i, i + batchSize);
    }
}

interface BacklinkEmail {
    id: number;
    subject: string;
}

async function validateEmailContent(subject: string, body: string): Promise<boolean> {
    console.log(`Validating email content for subject: ${subject}`);
    const prompt = `
    Analyze the following email subject and body. Determine if it's about guest posting or link exchange offers.
    Respond with only "true" if it is, or "false" if it's not.

    Subject: ${subject}

    Body:
    ${body}
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 5,
            temperature: 0.1,
        });
        const result = response.choices[0].message.content?.trim().toLowerCase() === 'true';
        console.log(`Validation result for "${subject}": ${result}`);
        return result;
    } catch (error) {
        console.error('Error validating email content:', error);
        return false;
    }
}

function filterBacklinkEmails(emailIds: number[]): Promise<BacklinkEmail[]> {
    console.log(`Filtering ${emailIds.length} emails for backlink requests...`);
    return new Promise((resolve, reject) => {
        const backlinkEmails: BacklinkEmail[] = [];
        let processed = 0;

        emailIds.forEach((emailId) => {
            imap.fetch(emailId, { bodies: '' }).on('message', (msg: typeof ImapMessage) => {
                msg.on('body', (stream: typeof Readable) => {
                    simpleParser(stream, async (err: Error | null, parsed: typeof ParsedMail) => {
                        if (err) {
                            console.error(`Error parsing email ${emailId}:`, err);
                            return reject(err);
                        }
                        if (parsed.subject && parsed.text) {
                            const isValid = await validateEmailContent(parsed.subject, parsed.text);
                            if (isValid) {
                                console.log(`Found valid backlink request: ${parsed.subject}`);
                                backlinkEmails.push({ id: emailId, subject: parsed.subject });
                            }
                        }
                        processed++;
                        if (processed === emailIds.length) {
                            console.log(`Filtered ${backlinkEmails.length} backlink emails out of ${emailIds.length} total`);
                            resolve(backlinkEmails);
                        }
                    });
                });
            });
        });
    });
}

async function generateReply(emailSubject: string): Promise<string> {
    console.log(`Generating reply for subject: ${emailSubject}`);
    const prompt = `Generate a professional reply to an email about '${emailSubject}' related to backlink exchange.`;
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });
        console.log('Reply generated successfully');
        return response.choices[0].message.content || '';
    } catch (error) {
        console.error('Error generating reply:', error);
        throw error;
    }
}

interface ReplyContent {
    subject: string;
    body: string;
}

async function saveDraft(replyContent: ReplyContent): Promise<void> {
    console.log(`Saving draft for subject: ${replyContent.subject}`);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: USERNAME,
            pass: PASSWORD,
        },
    });

    const mailOptions = {
        from: USERNAME,
        to: USERNAME,
        subject: `Re: ${replyContent.subject}`,
        text: replyContent.body,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Draft saved successfully');
    } catch (error) {
        console.error('Error saving draft:', error);
        throw error;
    }
}

async function main(): Promise<void> {
    console.log('Starting mail checker script...');
    let imap: Imap | null = null;
    try {
        imap = await connectToGmail();

        let totalProcessed = 0;
        for await (const emailBatch of fetchEmails(20)) {
            console.log(`Processing batch of ${emailBatch.length} emails`);
            const backlinkEmails = await filterBacklinkEmails(emailBatch);

            for (const { id, subject } of backlinkEmails) {
                const replyContent = await generateReply(subject);
                await saveDraft({ subject, body: replyContent });
                totalProcessed++;
            }
        }

        console.log(`Finished processing. Total emails processed: ${totalProcessed}`);
    } catch (error) {
        console.error('Error in main process:', error);
    } finally {
        if (imap) {
            imap.end();
        }
        console.log('Mail checker script completed');
    }
}

main();
