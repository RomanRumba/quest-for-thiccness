import { ChangeDetectorRef, Component } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Excersize } from 'src/app/models/excersize';
import { ExcersizeformConfig } from 'src/app/models/modals/ExcersizeformConfig';
import { Program } from 'src/app/models/program';
import { CommonService } from 'src/app/services/commonService';
import { InsultService } from 'src/app/services/insultService';

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
    version: 0,
    id: "",
    name: "",
    schedule: [],
    exesices: []
  };

  // this object is used to update the sets for the future exersizezes
  // so that the user does not see their changes at the same time
  public programForUpdating : Program = {
    version: 0,
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
  public counterRef: any;

  public showUpdateForm:boolean = false;
  public exersizeSetIDToUpdate: string = "";
  public exersizeIDToUpdate: string = "";
  public repsOrMin:number | undefined;
  public weightOrSec:number | undefined;
  public rest:number| undefined ;

  public currentImgsToRotate: string[]| undefined = [];
  public currentImgIndex: number = 0;
  public currentImgToRotate: string | undefined;
  public rotateRef : any;

  // There is an issue with IFRAMES inside tabs, basically when a change occurs in the 
  // component the sanitizer.bypassSecurityTrustResourceUrl function needs to re-run which is techinically fine
  // but whats not fine is that it will be seen as a new url so the IFrame will "re-render"
  // and the user will see some flickering, so the solutin is to generate static urls
  // so the Iframe wont "re-render"
  public exersizeYoutubeUrls: {[key: string]: SafeResourceUrl}= {};

  constructor(private commonService: CommonService,
              private ref: DynamicDialogRef, 
              private config: DynamicDialogConfig,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,
              public cdRef:ChangeDetectorRef,
              public sanitizer: DomSanitizer,
              public insultService: InsultService) { }

  ngOnInit() 
  {
    this.loading = true;
    this.selectedExcersizes = (<ExcersizeformConfig>this.config.data).excersizes;
    this.program = (<ExcersizeformConfig>this.config.data).program;
    this.program.exesices.forEach(exesice => 
    {
      if(exesice.resourceUrl !== null && (exesice.resourceUrl.includes('www.youtube') === true || exesice.resourceUrl.includes('youtu.be') === true))
      {
        this.exersizeYoutubeUrls[exesice.exesiceID] = this.sanitizer.bypassSecurityTrustResourceUrl(exesice.resourceUrl);
      }

      this.exersizeFinished[exesice.exesiceID] = false;
      exesice.sets.forEach(settoAdd => 
      {
        this.setsTracker[settoAdd.setId] = false;
      });
    });

    // I have no fucking clue why but object.assign still keeps the references somehow...
    // this is another way of copying objects.
    this.programForUpdating =JSON.parse(JSON.stringify(this.program));

    this.currentExersizeID = "";
    this.currentExersizeSetID =""; 
    this.loading = false;

    this.currentImgsToRotate = this.selectedExcersizes[0].resourseUrl;
    this.rotateResourceImg();
    this.currentImgIndex = 0;
  }

  // Need to implement this to remove the timeout counter
  ngOnDestroy() 
  {
    clearTimeout(this.counterRef);
    clearTimeout(this.rotateRef); 
  }

  // Fetches the name of the exersize.
  getExersizeName(id:string): string
  {
    let e = this.selectedExcersizes.find(e => e.id === id);
    return e? e.name : 'error excersize not found';
  }

  // I learn from the Javascript forefathers where just like in dates 
  // the only way to subtract is to add a negative integer..... 
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
    this.clearUpdateSet();
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

    clearTimeout(this.counterRef);
    this.startRestCountDown(exersizeId, setId);
  }

  setFinished(exersizeId: string, setId: string)
  {
    let restTimeInSet = this.program.exesices.find(e => e.exesiceID === exersizeId)?.sets.find(r => r.setId == setId);
    this.showTimer = true;
    this.isRestTimer = true;
    this.currentMaxRestTime = <number>restTimeInSet?.pause;
    this.restTimeCounter = <number>restTimeInSet?.pause;

    // if the user does not want to see the rest timer we just set it as 0
    if(this.commonService.getDefaultSettingForKey(this.commonService.RESTCLOCKSETTING, "false") === "false")
    {
      this.restTimeCounter = 0;
    }

    // Show the form to update the finished set
    this.repsOrMin = <number>restTimeInSet?.repsOrMin;
    this.weightOrSec = <number>restTimeInSet?.weightOrSec;
    this.rest = <number>restTimeInSet?.pause;
    this.exersizeSetIDToUpdate = setId;
    this.exersizeIDToUpdate = exersizeId;
    this.showUpdateForm = true;

    // There is a bug in primeng or angular which throws exceptions if you disable the component after clicking on it
    // detect changes is a temporary work around.
    this.cdRef.detectChanges();
    clearTimeout(this.counterRef);
    this.startRestCountDown(exersizeId, null);
  }

  startRestCountDown(exersizeId: string, isSetBased: string | null)
  {
    clearTimeout(this.counterRef);
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
    this.counterRef = setTimeout(() => { this.startRestCountDown(exersizeId,isSetBased); }, 1000);
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
      this.currentExersizeID = "";
      this.currentExersizeSetID =""; 
    }
  }

  skipUpdateSet()
  {
    if(this.insultService.insultOn && Math.floor(Math.random() * 10) > 4)
    {
      this.messageService.add({severity:'success', summary: '', detail: this.insultService.getRandomInsultType(6)});
    }
    this.clearUpdateSet();
  }

  clearUpdateSet()
  {
    this.showUpdateForm = false;
    this.exersizeSetIDToUpdate = "";
    this.exersizeIDToUpdate= "";
    this.repsOrMin = undefined;
    this.weightOrSec = undefined;
    this.rest = undefined;
  }

  updateMyCurrentSet()
  {
    let exersizeToUpdate = this.program.exesices.findIndex(e => e.exesiceID === this.exersizeIDToUpdate);
    if(exersizeToUpdate !== -1)
    {
      let setInexersizeToUpdate = this.program.exesices[exersizeToUpdate].sets.findIndex(s => s.setId === this.exersizeSetIDToUpdate);
      if(setInexersizeToUpdate !== -1)
      {
        this.programForUpdating.exesices[exersizeToUpdate].sets[setInexersizeToUpdate].repsOrMin = <number>this.repsOrMin;
        this.programForUpdating.exesices[exersizeToUpdate].sets[setInexersizeToUpdate].weightOrSec = <number>this.weightOrSec;
        this.programForUpdating.exesices[exersizeToUpdate].sets[setInexersizeToUpdate].pause = <number>this.rest;
        this.commonService.updateProgram(this.programForUpdating);
        this.clearUpdateSet();
        if(this.insultService.insultOn && Math.floor(Math.random() * 10) > 4)
        {
          this.messageService.add({severity:'success', summary: '', detail: this.insultService.getRandomInsultType(5)});
        }
        else {
          this.messageService.add({severity:'success', summary: 'Set Updated', detail: "Your set has been updated"});
        }
      }
      else
      {
        this.messageService.add({severity:'error', summary: 'Something broke??', detail: "System encountered an error please regresh the page, if this percists delete the program"});
      }
    }
    else
    {
      this.messageService.add({severity:'error', summary: 'Something broke??', detail: "System encountered an error please regresh the page, if this percists delete the program"});
    }
  }

  setNewExersizeAnimation(event: any)
  {
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

}
