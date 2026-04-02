const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const PDFDocument = require("pdfkit")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"])
    })),
    preparationPlan: z.array(z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string())
    })),
    title: z.string()
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate an interview report for a candidate with the following details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)
}


async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    try {

        const prompt = `
Create a professional resume using the following details:

Resume Content: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Use proper sections:
PROFESSIONAL SUMMARY
TECHNICAL SKILLS
EXPERIENCE
PROJECTS
EDUCATION

Keep it clean and professional.
`

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt
        })

        const aiText = response.text || "Resume could not be generated properly."

        // ✅ UPDATED PDF DESIGN
        const doc = new PDFDocument({ margin: 50 })

        let buffers = []
        doc.on("data", buffers.push.bind(buffers))

        // Header
        doc.fontSize(20).fillColor("#000").text("CANDIDATE", { align: "center" })
        doc.moveDown(0.5)

        doc.fontSize(10).fillColor("#555")
            .text("City, Country | +91 XXXXXXXX | email@example.com", { align: "center" })
        doc.moveDown(1)

        const lines = aiText.split("\n")

        lines.forEach(line => {
            const lower = line.toLowerCase().trim()

            if (
                lower.includes("summary") ||
                lower.includes("skills") ||
                lower.includes("experience") ||
                lower.includes("projects") ||
                lower.includes("education") ||
                lower.includes("certifications")
            ) {
                doc.moveDown(1)
                doc.fontSize(14)
                    .fillColor("#000")
                    .text(line.toUpperCase(), { underline: true })
                doc.moveDown(0.5)
            } 
            else if (line.trim() === "") {
                doc.moveDown(0.5)
            } 
            else {
                doc.font("Helvetica").fontSize(11)
                    .fillColor("#333")
                    .text(line, {
                        lineGap: 2
                    })
            }
        })

        doc.end()

        return await new Promise((resolve) => {
            doc.on("end", () => {
                resolve(Buffer.concat(buffers))
            })
        })

    } catch (err) {
        console.log("PDF ERROR:", err)
        throw err
    }
}

module.exports = { generateInterviewReport, generateResumePdf }










































// const { GoogleGenAI } = require("@google/genai")
// const { z } = require("zod")
// const { zodToJsonSchema } = require("zod-to-json-schema")
// const puppeteer = require("puppeteer")
// const PDFDocument = require("pdfkit")

// async function generateResumePdf({ resume, selfDescription, jobDescription }) {
//     try {
//         const doc = new PDFDocument()

//         let buffers = []
//         doc.on("data", buffers.push.bind(buffers))

//         doc.fontSize(20).text("Resume", { align: "center" })
//         doc.moveDown()

//         doc.fontSize(14).text("Profile:")
//         doc.fontSize(12).text(selfDescription)
//         doc.moveDown()

//         doc.fontSize(14).text("Skills & Experience:")
//         doc.fontSize(12).text(resume)
//         doc.moveDown()

//         doc.fontSize(14).text("Target Role:")
//         doc.fontSize(12).text(jobDescription)

//         doc.end()

//         return await new Promise((resolve) => {
//             doc.on("end", () => {
//                 resolve(Buffer.concat(buffers))
//             })
//         })

//     } catch (err) {
//         console.log("PDF ERROR:", err)
//         throw err
//     }
// }

// const ai = new GoogleGenAI({
//     apiKey: process.env.GOOGLE_GENAI_API_KEY
// })


// const interviewReportSchema = z.object({
//     matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
//     technicalQuestions: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intention: z.string().describe("The intention of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
//     behavioralQuestions: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intention: z.string().describe("The intention of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
//     skillGaps: z.array(z.object({
//         skill: z.string().describe("The skill which the candidate is lacking"),
//         severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
//     })).describe("List of skill gaps in the candidate's profile along with their severity"),
//     preparationPlan: z.array(z.object({
//         day: z.number().describe("The day number in the preparation plan, starting from 1"),
//         focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
//         tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
//     })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
//     title: z.string().describe("The title of the job for which the interview report is generated"),
// })

// async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


//     const prompt = `Generate an interview report for a candidate with the following details:
//                         Resume: ${resume}
//                         Self Description: ${selfDescription}
//                         Job Description: ${jobDescription}
// `

//     const response = await ai.models.generateContent({
//         model: "gemini-3-flash-preview",
//         contents: prompt,
//         config: {
//             responseMimeType: "application/json",
//             responseSchema: zodToJsonSchema(interviewReportSchema),
//         }
//     })

//     return JSON.parse(response.text)


// }



// async function generatePdfFromHtml(htmlContent) {
// const browser = await puppeteer.launch({
//     headless: true,
//     args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--disable-gpu"
//     ]
// })

//     const page = await browser.newPage()
//     await page.setContent(htmlContent)

//     const pdfBuffer = await page.pdf({
//         format: "A4"
//     })

//     await browser.close()
//     return pdfBuffer
// }

// async function generateResumePdf({ resume, selfDescription, jobDescription }) {

//     try {
//         const html = `
//         <html>
//         <head>
//             <style>
//                 body { font-family: Arial; padding: 20px; }
//                 h1 { color: #333; }
//                 h2 { color: #555; }
//                 p { line-height: 1.5; }
//             </style>
//         </head>
//         <body>
//             <h1>Resume</h1>

//             <h2>Profile</h2>
//             <p>${selfDescription}</p>

//             <h2>Skills & Experience</h2>
//             <p>${resume}</p>

//             <h2>Target Role</h2>
//             <p>${jobDescription}</p>
//         </body>
//         </html>
//         `

//         const pdfBuffer = await generatePdfFromHtml(html)

//         return pdfBuffer

//     } catch (err) {
//         console.log("PDF ERROR:", err)
//         throw err
//     }
// }

// module.exports = { generateInterviewReport, generateResumePdf }