import { Injectable } from '@nestjs/common';
import { VaultService } from '../vault/vault.service';
import Groq from 'groq-sdk';

@Injectable()
export class FormatsService {
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

    async chatWithGroq(prompt: string): Promise<string> {
        const chat = await this.groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente útil. Tu tarea es ayudame a clasificar mensajes y devolverlos en una estructura JSON clara y concisa. Se dentro de tus fucniones ta recibir un mensaje con un caso, el cual posee un numero espesifico. A su vez una serie de tareas que debes clasificar en una estructura JSON. Cada tarea tiene una accion espesifica debes guardarla. A su vez vendra una serie de materiales con un valor espesifico que debes guardar. Ten en cunat que est aen pesos colombianos. Por ultimo se debe etenr ene cuenta que hay un valor de mano de obra. Finalmente debes devolver la informacion en una estructura JSON clara y concisa, siguiendo el siguiente formato: { caso: numero_del_caso, tareas: [ { descripcion: descripcion_de_la_tarea, accion: accion_de_la_tarea } ], materiales: [ { descripcion: descripcion_del_material, catidad: cantidad_del_material, valor_unitario: valor_unitario_del_material, valor_total: valor_total_del_material }, mano de obra: valor_mano_de_obra ] }. Dentro de la respuesta solo debes enviar el JSON, nada mas.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: this.iaModel,
            temperature: 0,
        });

        const rawChat = chat.choices[0].message.content;
        const parsedChat = this.markdownJsonToObject(rawChat!);
        return parsedChat; 
    }
}
