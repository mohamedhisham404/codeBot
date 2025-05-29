import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { CreateMessageDto } from './dto/create-message.dto';
import { DataSource, Repository } from 'typeorm';
import { handleError } from 'src/utils/errorHandling';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DatabaseLlmService {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepositry: Repository<User>,
  ) {}

  async sendEvent(createMessageDto: CreateMessageDto, res: Response) {
    try {
      const schema: Record<string, string[]> = {};
      this.dataSource.entityMetadatas.forEach((entity) => {
        const tableName = entity.tableName;
        const columnNames = entity.columns.map((column) => column.databaseName);
        schema[tableName] = columnNames;
      });

      const allData = await this.userRepositry.find({
        relations: {
          posts: true,
          likes: true,
        },
      });

      const model = new ChatGroq({
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        apiKey: this.configService.get<string>('GROQ_API_KEY'),
      });

      const prompt = new PromptTemplate({
        inputVariables: ['UserPrompt', 'schema', 'data'],
        template: `{UserPrompt} \n\n {schema} \n\n {data}`,
      });

      const formatted = await prompt.format({
        UserPrompt: createMessageDto.prompt,
        schema,
        data: allData,
      });
      const stream = await model.invoke(formatted);

      res.send(stream.content);
    } catch (error) {
      handleError(error);
    }
  }
}
