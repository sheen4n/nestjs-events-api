import {Controller, Patch, Post} from "@nestjs/common";
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Profile} from "../auth/profile.entity";
import {User} from "../auth/user.entity";
import {Subject} from './subject.entity';
import {Teacher} from './teacher.entity';

@Controller('school')
export class TrainingController {
  constructor (
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}


  @Post('/create')
  public async savingRelation () {
    const subject = new Subject();
    subject.name = 'Math';

    const teacher1 = new Teacher();
    teacher1.name = 'John Doe';

    const teacher2 = new Teacher();
    teacher2.name = 'Harry Doe';

    subject.teachers = [teacher1, teacher2];

    await this.subjectRepository.save(subject);
  }

  @Post('/remove')
  public async removingRelation () {
    const subject = await this.subjectRepository.findOne(
      1,
      {relations: ['teachers']}
    );

    subject.teachers = subject.teachers.filter(teacher => teacher.id !== 2);

    await this.subjectRepository.save(subject);
  }

  @Patch('/update')
  public updateAll () {
    this.subjectRepository.createQueryBuilder('s')
      .update()
      .set({name: "Confidential"})
      .execute();
  }

  @Post('/create2')
  public async savingRelation2 () {
    const subject = await this.subjectRepository.findOne(2);

    const teacher1 = await this.teacherRepository.findOne(5);
    const teacher2 = await this.teacherRepository.findOne(6);

    return this.subjectRepository
      .createQueryBuilder()
      .relation(Subject, 'teachers')
      .of(subject)
      .add([teacher1, teacher2]);
  }

  @Post('/create3')
  public async oneToOne () {
    // How to use One to One
    // const user = new User();
    // const profile = new Profile();

    // How to save the profile
    // user.profile = profile;

    // How to remove the profile
    // user.profile = null;
    // Save the user here
  }
}