import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { conditionalPindingDto } from './dto/create-conditionalPindin.dto';
import { DataSource, Repository } from 'typeorm';
import { handleError } from 'src/utils/errorHandling';
import { ConfigService } from '@nestjs/config';
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { userEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { idPindingDto } from './dto/create_idPinding.dto';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { SchemaData } from 'src/interfaces/schema';
import { postEntity } from './entities/post.entity';
import { likeEntity } from './entities/like.entity';

@Injectable()
export class DatabasePindingService {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,

    @InjectRepository(userEntity)
    private readonly userRepositry: Repository<userEntity>,
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

  async entityPinding(idPindingDto: idPindingDto, res: Response) {
    try {
      const model = new ChatGroq({
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        apiKey: this.configService.get<string>('GROQ_API_KEY'),
      });

      const entityMap = {
        postEntity: postEntity,
        likeEntity: likeEntity,
        userEntity: userEntity,
      };
      type EntityMap = typeof entityMap;
      type EntityKey = keyof EntityMap;

      const schema: Record<string, string[]> = {};
      this.dataSource.entityMetadatas.forEach((entity) => {
        const tableName = entity.tableName;
        const columnNames = entity.columns.map((column) => column.databaseName);
        schema[tableName] = columnNames;
      });
      const userphrase = idPindingDto.phrase;
      const indexofat = userphrase.indexOf('@');
      const userPrompt = userphrase.substring(0, indexofat);
      const data = userphrase.substring(indexofat + 1);

      const prompt = new PromptTemplate({
        inputVariables: ['schema', 'data', 'userPrompt'],
        template: `You are given the following:

              1. A database schema in JSON format (table names as keys, columns as string arrays).
              2. Some input data in JSON format.
              3. A user prompt that gives context about what data to retrieve.

              Your task:

              - Identify which table the input data most likely belongs to (use the ID or other matching fields).
              - Determine the root entity to query from (the one with an 'id' field in the provided data).
              - Identify any related entities that should be queried to fulfill the user prompt (based on relationships in the schema).
              - Return a JSON object with the following structure (use camelCase and convert table names to Entity names by removing the trailing 's' and appending 'Entity'):

              Example output:

              {{
                "rootEntity": "userEntity",
                "columns": {{
                  "id": 2
                }},
                "relationEntities": ["postEntity", "likeEntity"]
              }}

              Rules:

              - Do not include any explanation or extra text.
              - Only return valid JSON.
              - Follow the structure strictly.

              Schema:
              {schema}

              Data:
              {data}

              User Prompt:
              {userPrompt}`,
      });
      const parser = new JsonOutputParser();

      const chain = prompt.pipe(model).pipe(parser);

      const stream = (await chain.invoke({
        schema,
        data,
        userPrompt,
      })) as SchemaData;

      console.log(stream);

      const { columns, relationEntities } = stream;

      const rootEntityKey = stream.rootEntity as EntityKey;
      const rootEntityClass = entityMap[rootEntityKey];
      const metadata = this.dataSource.getMetadata(rootEntityClass);

      const relationNames = metadata.relations
        .filter((rel) => {
          if (typeof rel.type !== 'function') return false;

          const matchedEntry = Object.entries(entityMap).find(
            ([_, value]) => value === rel.type,
          );

          if (!matchedEntry) return false;

          const entityName = matchedEntry[0];
          return relationEntities.includes(entityName);
        })
        .map((rel) => rel.propertyName);

      const relationsObj = relationNames.reduce(
        (acc, name) => {
          acc[name] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      console.log(relationsObj);

      const alldata = await this.dataSource.manager.find(rootEntityClass, {
        where: columns,
        relations: relationsObj,
      });
      res.send(alldata);

      // const allData = await this.userRepositry.find({
      //   where: {
      //     id: userId,
      //     posts: { id: postId },
      //     likes
      //   },
      //   relations: {
      //     posts: true,
      //     likes: true,
      //   },
      // });

      //   const prompt = new PromptTemplate({
      //     inputVariables: ['phrase', 'schema', 'data'],
      //     template: `i will give you a phrase and DB schema and i want you to pind this phrase with the data i inform you with,\n\n{phrase} \n\n{schema} \n\n{data}`,
      //   });

      //   const formatted = await prompt.format({
      //     phrase: userPrompt,
      //     schema,
      //     data: allData,
      //   });
      //   const stream = await model.invoke(formatted);

      //   res.send(stream.content);
    } catch (error) {
      handleError(error);
    }
  }
}
