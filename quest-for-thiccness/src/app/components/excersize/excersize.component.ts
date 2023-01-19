import { ChangeDetectorRef, Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Excersize } from 'src/app/models/excersize';
import { ExcersizeformConfig } from 'src/app/models/modals/ExcersizeformConfig';
import { Program } from 'src/app/models/program';
import { CommonService } from 'src/app/services/commonService';

@Component({
  selector: 'app-excersize',
  templateUrl: './excersize.component.html',
  styleUrls: ['./excersize.component.scss'],
  providers: [ConfirmationService,MessageService]
})
export class ExcersizeComponent 
{
  public loading: boolean = true;
  private selectedExcersizes: Excersize[] = [];
  
  public program: Program = {
    id: "",
    name: "",
    schedule: [],
    exesices: []
  };

  public activeExersize: number = 0;
  public currentExersizeID: string = "";
  public currentExersizeSetID: string =""; 
  public exersizeFinished: {[key: string]: boolean}= {};
  public setsTracker: {[key: string]: boolean}= {};
  public showTimer : boolean = false;
  public isRestTimer :boolean = false;
  public currentMaxRestTime: number = 0;
  public restTimeCounter: number = 0;
  public counterRed: any;

  constructor(private commonService: CommonService,
              private ref: DynamicDialogRef, 
              private config: DynamicDialogConfig,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,
              public cdRef:ChangeDetectorRef,
              public sanitizer: DomSanitizer) { }

  ngOnInit() 
  {
    this.loading = true;
    this.selectedExcersizes = (<ExcersizeformConfig>this.config.data).excersizes;
    this.program = (<ExcersizeformConfig>this.config.data).program;
    this.program.exesices.forEach(exesice => 
    {
      this.exersizeFinished[exesice.exesiceID] = false;
      exesice.sets.forEach(settoAdd => 
      {
        this.setsTracker[settoAdd.setId] = false;
      });
    });
    this.currentExersizeID = "";
    this.currentExersizeSetID =""; 
    this.loading = false;
  }

  ngOnDestroy() 
  {
    clearTimeout(this.counterRed);
  }
  // Fetches the name of the exersize.
  getExersizeName(id:string): string
  {
    let e = this.selectedExcersizes.find(e => e.id === id);
    return e? e.name : 'error excersize not found';
  }

  addToRestTime(timeToAdd: number)
  {
    if(this.isRestTimer === true)
    {
      this.restTimeCounter += timeToAdd;
    }
  }

  startOnExersize(event: any,exesiceID : string)
  {
    if(this.currentExersizeID !== "" && this.currentExersizeSetID !=="")
    {
      this.confirmationService.confirm({
        target: event.target,
        message: 'You are currently finishing another exercise, are you sure that you want to cancel it and start on this one?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => { this._startOnExersize(exesiceID); },
        reject: () => {}
      });
    }
    else
    {
      this._startOnExersize(exesiceID);
    }
  }

  private _startOnExersize(exesiceID : string)
  {
    this.currentExersizeID = exesiceID;
    let setsToCheck = this.program.exesices.find(e => e.exesiceID === this.currentExersizeID)?.sets;
    if(setsToCheck && setsToCheck.length > 0)
    {
      this.currentExersizeSetID = setsToCheck[0].setId;
    }
    else
    {
      this.currentExersizeID = "";
      this.currentExersizeSetID =""; 
      this.messageService.add({severity:'error', summary: 'Exersize has no sets', detail: "Cannot start this exersize because it has no sets, please update the program"});
    }
  }

  startTimeBasedSet(exersizeId: string, setId: string)
  {
    let timeInSet = this.program.exesices.find(e => e.exesiceID === exersizeId)?.sets.find(r => r.setId == setId);
    this.showTimer = true;
    this.currentMaxRestTime = <number>timeInSet?.repsOrMin*60 + <number>timeInSet?.weightOrSec;
    this.restTimeCounter = <number>timeInSet?.repsOrMin*60 + <number>timeInSet?.weightOrSec;

    clearTimeout(this.counterRed);
    this.startRestCountDown(exersizeId, setId);
  }

  setFinished(exersizeId: string, setId: string)
  {
    let restTimeInSet = this.program.exesices.find(e => e.exesiceID === exersizeId)?.sets.find(r => r.setId == setId);
    this.showTimer = true;
    this.isRestTimer = true;
    this.currentMaxRestTime = <number>restTimeInSet?.pause;
    this.restTimeCounter = <number>restTimeInSet?.pause;
    // There is a bug in primeng or angular which throws exceptions if you disable the component after clicking on it
    // detect changes is a temporary work around.
    this.cdRef.detectChanges();
    clearTimeout(this.counterRed);
    this.startRestCountDown(exersizeId, null);
  }

  startRestCountDown(exersizeId: string, isSetBased: string | null)
  {
    clearTimeout(this.counterRed);
    if(this.restTimeCounter <= 0)
    {
      this.showTimer = false;
      this.isRestTimer = false;
      //if isSetBased is a setid then we need to start the cool down timer next
      if(isSetBased !== null)
      {
        this.setsTracker[isSetBased] = true;
        this.setFinished(exersizeId, isSetBased);
        return;
      }
      this.checkIfExersizeIsFinished(exersizeId);
      return;
    }
    this.restTimeCounter -= 1;
    this.counterRed = setTimeout(() => { this.startRestCountDown(exersizeId,isSetBased); }, 1000);
  }

  checkIfExersizeIsFinished(exersizeId: string)
  {
    let isFinished = true;
    let setsInExersize = this.program.exesices.find(e => e.exesiceID === exersizeId);
    setsInExersize?.sets.forEach(setToCheck => 
    {
      if(this.setsTracker[setToCheck.setId] === false)
      {
        isFinished = false;
      }
    });

    if(isFinished)
    {
      this.exersizeFinished[exersizeId] = true;
      this.messageService.add({severity:'success', summary: 'Exersize finished', detail: "All sets in "});
      this.currentExersizeID = "";
      this.currentExersizeSetID =""; 
    }
  }

}
