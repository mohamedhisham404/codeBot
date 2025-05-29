import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { loadFile } from 'src/utils/loadFiles';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { Response } from 'express';
import { handleError } from 'src/utils/errorHandling';

@Injectable()
export class CodeService {
  constructor(private configService: ConfigService) {}

  async sendEvent(createMessageDto: CreateMessageDto, res: Response) {
    // await new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve('hi');
    //   }, 35000);
    // });
    // return 'Hi THERE';
    try {
      let code: string | undefined;
      if (createMessageDto.prompt || createMessageDto.codeFiles) {
        if (createMessageDto.codeFiles) {
          code = createMessageDto.codeFiles
            .map((filePath) => {
              const content = loadFile(filePath);
              return `// FILE: ${filePath}\n${content}`;
            })
            .join('\n\n=================\n\n');
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const model = new ChatGroq({
          model: 'llama-3.3-70b-versatile',
          temperature: 0,
          apiKey: this.configService.get<string>('GROQ_API_KEY'),
        });

        const prompt = new PromptTemplate({
          inputVariables: ['code', 'UserPrompt'],
          template: `{code} \n {UserPrompt}`,
        });

        const formatted = await prompt.format({
          UserPrompt: createMessageDto.prompt,
          code,
        });
        const stream = await model.stream(formatted);

        for await (const chunk of stream) {
          const content =
            typeof chunk.content === 'string'
              ? chunk.content
              : JSON.stringify(chunk.content);
          res.write(`data: ${content}\n\n`);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      res.end();
    }
  }
}
