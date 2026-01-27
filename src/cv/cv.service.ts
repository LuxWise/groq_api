import { Injectable, OnModuleInit } from '@nestjs/common';
import { VaultService } from '../vault/vault.service';
import Groq from 'groq-sdk';
import { InputCreateCv } from './types/input-create-cv.types';

@Injectable()
export class CvService implements OnModuleInit {
    constructor(
        private readonly vaultService: VaultService
    ) { }

    private groq: Groq;
    private iaModel: string;
    private markdownJsonToObject(input: string) {
        const cleaned = input
            .replace(/^```json\s*/i, '')
            .replace(/```$/, '')
            .trim();

        return JSON.parse(cleaned);
    }

    async onModuleInit() {
        const groqApiKey = await this.vaultService.getGroqApiKey();
        const iaModel =  await this.vaultService.getIaModel();

        if (!groqApiKey) {
            throw new Error('API_KEY is not defined in environment variables');
        }

        this.groq = new Groq({ apiKey: groqApiKey });
        this.iaModel = iaModel;
    }

    async createCv(input: InputCreateCv): Promise<any> {
        const chat = await this.groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Tu tarea es ayudar a crear un currículum vitae (CV) profesional bien estructurado basado en la información proporcionada por el usuario, ajustada a la oferta de trabajo proporcionada por el usuario. En la cual puedes inferir un poco mas informacion mas alla de la suministrada por el usuario. Destacando habilidades, experiencias y logros relevantes para el puesto. El CV debe estar en formato JSON, siguiendo estrictamente la estructura proporcionada a continuación. No incluyas explicaciones adicionales ni texto fuera del formato JSON. Estructura del CV en JSON: { \"personal_info\": { \"name\": \"\", \"email\": \"\", \"phone\": \"\", \"address\": \"\" }, \"summary\": \"\", \"work_experience\": [ { \"job_title\": \"\", \"company\": \"\", \"start_date\": \"\", \"end_date\": \"\", \"responsibilities\": [\"\"], \"achievements\": [\"\"] } ], \"education\": [ { \"degree\": \"\", \"institution\": \"\", \"start_date\": \"\", \"end_date\": \"\" } ], \"skills\": [\"\"], \"certifications\": [ { \"name\": \"\", \"issuing_organization\": \"\", \"date_obtained\": \"\" } ], \"languages\": [ { \"language\": \"\", \"proficiency_level\": \"\" } ] } Asegúrate de que el CV sea claro, conciso y relevante para la oferta de trabajo. Ten en cuenta las mejores prácticas de redacción de CV y adapta el contenido según la industria y el puesto al que se está aplicando. Utiliza un lenguaje profesional y evita errores gramaticales o tipográficos. Recuerda que el objetivo es presentar al candidato de la mejor manera posible para aumentar sus posibilidades de éxito en el proceso de selección. Puedes inferir informacion adicional que no haya sido suministrada por el usuario, pero que sea relevante para el puesto de trabajo. Puedes inventar informacion si es necesario."
                },
                {
                    role: "user",
                    content: input.userDataPrompt,
                },
                {
                    role: "user",
                    content: input.jobOfferPrompt,
                }
            ],
            model: this.iaModel,
            temperature: 0.5,
        })

        const rawChat = chat.choices[0].message.content;

        if (!rawChat) {
            throw new Error('No response from IA model');
        }

        const result = this.markdownJsonToObject(rawChat);
        return result;
    }
}
