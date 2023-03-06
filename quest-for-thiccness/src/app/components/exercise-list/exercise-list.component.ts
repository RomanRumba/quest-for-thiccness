import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Excersize } from 'src/app/models/excersize';
import { ExcersizeformConfig } from 'src/app/models/modals/ExcersizeformConfig';
import { Program } from 'src/app/models/program';
import { CommonService } from 'src/app/services/commonService';

@Component({
  selector: 'app-exercise-list',
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss']
})
export class ExerciseListComponent 
{
  private selectedExcersizes: Excersize[] = [];
  public myPrograms: Program[] = [];
  
  constructor(private commonService: CommonService,
    private ref: DynamicDialogRef, 
    private config: DynamicDialogConfig) { }

  ngOnInit() 
  {
    this.selectedExcersizes = (<ExcersizeformConfig>this.config.data).excersizes;
    this.myPrograms = this.commonService.getMyPrograms();
  }

  addToProgram(excerizeId: string, shouldOpen: boolean)
  {
    let programToAddExcersizesTo = this.myPrograms.find(t => t.id === excerizeId);
    
    this.selectedExcersizes.forEach(excerizeToAdd => 
    {
      let exerciseAlreadyInProgram = programToAddExcersizesTo?.exesices.findIndex(t => t.exesiceID === excerizeToAdd.id);
      if(typeof(exerciseAlreadyInProgram) !== "undefined" && exerciseAlreadyInProgram >= 0)
      {
        return; // skip
      }
      programToAddExcersizesTo?.exesices.push(
      {
        position: 0,
        resourceUrl: "",
        exesiceID: excerizeToAdd.id,
        isSetBased: true,
        notes: "",
        sets: []
      }); 
    });
    this.commonService.updateProgram(<Program>programToAddExcersizesTo);

    this.ref.close({updatedID: excerizeId, ShouldOpenUpdateForm: shouldOpen});
  }
}
