import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Excersize } from 'src/app/models/excersize';
import { ExcersizeformConfig } from 'src/app/models/modals/ExcersizeformConfig';
import { Program } from 'src/app/models/program';
import { CommonService } from 'src/app/services/commonService';
import { InsultService } from 'src/app/services/insultService';

@Component({
  selector: 'app-excersizeform',
  templateUrl: './excersizeform.component.html',
  styleUrls: ['./excersizeform.component.scss'],
  providers: [ConfirmationService,MessageService]
})
export class ExcersizeformComponent 
{
  private selectedExcersizes: Excersize[] = [];
  public flag: number = 1;

  public program: Program = {
    version: 0,
    id: "",
    name: "",
    schedule: [],
    exesices: []
  };

  public closingLabel = "Delete";
  public submitted: boolean = false;

  public repsOrMin:number | undefined;
  public weightOrSec:number | undefined;
  public rest:number| undefined ;

  public currentImgsToRotate: string[]| undefined = [];
  public currentImgIndex: number = 0;
  public currentImgToRotate: string | undefined;
  public rotateRef : any;

  public reorderToggle : boolean = true;
  constructor(private commonService: CommonService,
              private ref: DynamicDialogRef, 
              private config: DynamicDialogConfig,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,
              public insultService: InsultService) { }

  ngOnInit() 
  {
    this.flag = (<ExcersizeformConfig>this.config.data).flag;
    this.selectedExcersizes = (<ExcersizeformConfig>this.config.data).excersizes;
    this.submitted = false;
    this.rotateResourceImg();
    this.currentImgIndex = 0;
    if(this.flag === 1)
    {
      this.closingLabel = "Delete";
      this.program.id = this.commonService.generateUUID();
      this.selectedExcersizes.forEach((excersize: Excersize) => 
      {
        this.program.exesices.push({
            resourceUrl: "",
            exesiceID: excersize.id,
            isSetBased: true,
            notes: "",
            sets: []
          });   
      });
    }
    else if(this.flag === 2)
    {
      this.closingLabel = "Discard";
      this.program = this.config.data.program;
    }
  }

  saveProgram()
  {
    this.submitted = true;
    if(typeof(this.program.name) === "undefined" ||
      (typeof(this.program.name) !== "undefined" && this.program.name.trim().length === 0))
    {
      this.messageService.add({severity:'error', summary: '', detail: this.insultService.insultOn? this.insultService.getRandomInsultType(1): "please fill out set information"});
      return;
    }
    this.commonService.saveNewProgram(this.program);
    clearTimeout(this.rotateRef);
    this.ref.close(this.program);
  }
  
  updateProgram()
  {
    this.submitted = true;
    if(typeof(this.program.name) === "undefined" ||
      (typeof(this.program.name) !== "undefined" && this.program.name.trim().length === 0))
    {
      this.messageService.add({severity:'error', summary: '', detail: this.insultService.insultOn? this.insultService.getRandomInsultType(1): "please fill out set information"});
      return;
    }
    this.commonService.updateProgram(this.program);
    clearTimeout(this.rotateRef);
    this.ref.close(this.program);
  }

  // Fetches the name of the exersize.
  getExersizeName(id:string): string
  {
    let e = this.selectedExcersizes.find(e => e.id === id);
    return e? e.name : 'error excersize not found';
  }

  // adds a new set to the excersize id
  addNewSet(id: string)
  {
    if(typeof(this.repsOrMin) === "undefined" && typeof(this.weightOrSec) === "undefined")
    {
      this.messageService.add({severity:'error', summary: 'cant add empty set', detail: this.insultService.insultOn? this.insultService.getRandomInsultType(2): "please fill out set information"});
      return;
    }

    let exersizetoadd = this.program.exesices.find(e => e.exesiceID === id);
    if(exersizetoadd)
    {
      exersizetoadd.sets.push(
        {
          setId:this.commonService.generateUUID(),
          weightOrSec: typeof(this.weightOrSec) === "undefined"? 0: this.weightOrSec,
          repsOrMin: typeof(this.repsOrMin) === "undefined"? 0: this.repsOrMin,
          pause: typeof(this.rest) === "undefined"? 0: this.rest
        }
      );
      this.weightOrSec = undefined;
      this.repsOrMin=undefined;
      this.rest= undefined;
      
      // 40% chance to give user an insult
      if(this.insultService.insultOn && Math.floor(Math.random() * 10) > 4)
      {
        this.messageService.add({severity:'success', summary: '', detail: this.insultService.getRandomInsultType(3)});
      }
    }
  }

  // will shift the exersize in programs based on direction
  moveExersize(event: any, excerizeId: string, direction: -1 | 1)
  {
    let exersizeIndexInProgram = this.program.exesices.findIndex(e => e.exesiceID === excerizeId);

    if( exersizeIndexInProgram !== -1 && 
       !(exersizeIndexInProgram === 0 && direction === -1) &&
       !(exersizeIndexInProgram === this.program.exesices.length -1 && direction === 1))
    {
      let tempSwapStorage = this.program.exesices[exersizeIndexInProgram];
      let tempSwapStorage2 = this.selectedExcersizes[exersizeIndexInProgram];
      
      this.program.exesices[exersizeIndexInProgram] = this.program.exesices[exersizeIndexInProgram+direction];
      this.program.exesices[exersizeIndexInProgram+direction] = tempSwapStorage;

      this.selectedExcersizes[exersizeIndexInProgram] = this.selectedExcersizes[exersizeIndexInProgram+direction];
      this.selectedExcersizes[exersizeIndexInProgram+direction] = tempSwapStorage2;
    }
  }

  // is called when user changed exersizes
  clearFormData(event: any)
  {
    this.weightOrSec = undefined;
    this.repsOrMin=undefined;
    this.rest= undefined;
    this.currentImgsToRotate = this.selectedExcersizes[event.index].resourseUrl;
  }

  rotateResourceImg()
  {
    clearTimeout(this.rotateRef);
    if(typeof(this.currentImgsToRotate) !== "undefined" && this.currentImgsToRotate.length > 0)
    {
      this.currentImgToRotate = this.commonService.RESOURCEURL+this.currentImgsToRotate[this.currentImgIndex];
      this.currentImgIndex ++;

      if(this.currentImgIndex > this.currentImgsToRotate.length -1)
      {
        this.currentImgIndex = 0;
      }
    }
    this.rotateRef = setTimeout(() => { this.rotateResourceImg(); }, 1000);
  }

  // Confirmation which if true will delete a set within a exersize
  configDeleteExersizeSet(event: any, excerizeId: string, setId: string)
  {
    this.confirmationService.confirm({
      target: event.target,
      message: "Are you sure you want to delete this set?",
      icon: 'pi pi-exclamation-triangle',
      accept: () => 
      { 
        let exersizeInProgram = this.program.exesices.find(e => e.exesiceID === excerizeId);
        if(exersizeInProgram)
        {
          let setToDelete = exersizeInProgram.sets.findIndex(s => s.setId === setId);
          if(setToDelete !== -1)
          {
            exersizeInProgram.sets.splice(setToDelete,1);
          }
        }
      },
      reject: () => {
      }
    });
  }

 // Confirmation which if true will delete a exersize
  deleteExersize(event: any, exersizeID: string)
  {
    this.confirmationService.confirm({
      target: event.target,
      message: "Are you sure you want to delete this exersize?",
      icon: 'pi pi-exclamation-triangle',
      accept: () => 
      { 
        let exersizeInProgram = this.program.exesices.findIndex(e => e.exesiceID === exersizeID);
        if(exersizeInProgram !== -1)
        {
          this.program.exesices.splice(exersizeInProgram,1);
        }
      },
      reject: () => {}
    });
  }

  //This has to be of type any because typscript gets fucked up and does not understand event.target
  confirmDelete(event: any) 
  {
    this.confirmationService.confirm({
        target: event.target,
        message: this.flag === 1? 'Are you sure that you want to delete this program?' : 'Are you sure that you want to close without saving',
        icon: 'pi pi-exclamation-triangle',
        accept: () => { clearTimeout(this.rotateRef); this.ref.close(null); },
        reject: () => {}
    });
  }
}
