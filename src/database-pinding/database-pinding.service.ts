import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { conditionalPindingDto } from './dto/create-conditionalPindin.dto';
import { DataSource, Repository } from 'typeorm';
import { handleError } from 'src/utils/errorHandling';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { idPindingDto } from './dto/create_idPinding.dto';

@Injectable()
export class DatabasePindingService {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepositry: Repository<User>,
  ) {}

  async conditionalPinding(
    conditionalPindingDto: conditionalPindingDto,
    res: Response,
  ) {
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
      console.log(allData);
      const model = new ChatGroq({
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        apiKey: this.configService.get<string>('GROQ_API_KEY'),
      });

      const prompt = new PromptTemplate({
        inputVariables: ['phrase', 'condition', 'schema', 'data'],
        template: `i will give you a phrase and i want you to pind this phrase with the data and conditions i inform you with,\n\n{phrase} \n\n{condition} \n\n{schema} \n\n{data}`,
      });

      const formatted = await prompt.format({
        phrase: conditionalPindingDto.phrase,
        condition: conditionalPindingDto.condition,
        schema,
        data: allData,
      });
      const stream = await model.invoke(formatted);

      res.send(stream.content);
    } catch (error) {
      handleError(error);
    }
  }
  async idPinding(idPindingDto: idPindingDto, res: Response) {
    try {
      const schema: Record<string, string[]> = {};
      this.dataSource.entityMetadatas.forEach((entity) => {
        const tableName = entity.tableName;
        const columnNames = entity.columns.map((column) => column.databaseName);
        schema[tableName] = columnNames;
      });

      const userphrase = idPindingDto.phrase;
      const indexofat = userphrase.indexOf('@');
      const indexofcomma = userphrase.indexOf(',');
      const userPrompt = userphrase.substring(0, indexofat);
      const userId = Number(userphrase.substring(indexofat + 6, indexofcomma));
      const postId = Number(userphrase.substring(indexofcomma + 7));

      const allData = await this.userRepositry.find({
        where: {
          id: userId,
          posts: { id: postId },
        },
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
        inputVariables: ['phrase', 'schema', 'data'],
        template: `i will give you a phrase and DB schema and i want you to pind this phrase with the data i inform you with,\n\n{phrase} \n\n{schema} \n\n{data}`,
      });

      const formatted = await prompt.format({
        phrase: userPrompt,
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
