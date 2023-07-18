import { Component } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Excersize } from 'src/app/models/excersize';
import { ExcersizeformConfig } from 'src/app/models/modals/ExcersizeformConfig';
import { Program } from 'src/app/models/program';

@Component({
  selector: 'app-exersizestats',
  templateUrl: './exersizestats.component.html',
  styleUrls: ['./exersizestats.component.scss']
})
export class ExersizestatsComponent 
{
  private selectedExcersizes: Excersize[] = [];
  public program: Program = {
    version: 0,
    id: "",
    name: "",
    schedule: [],
    exesices: []
  };
  public dataSet: any = [];
  public options: any;
  
  constructor(private ref: DynamicDialogRef,
              private config: DynamicDialogConfig) { }

  ngOnInit() 
  {
    
    this.selectedExcersizes = (<ExcersizeformConfig>this.config.data).excersizes;
    this.program = (<ExcersizeformConfig>this.config.data).program;

    let muscleGroupMap = new Map();

    this.selectedExcersizes.forEach(selectedExcersize => 
    {
      selectedExcersize.target.forEach(primariesToAdd => 
      {
        if(muscleGroupMap.has(primariesToAdd))
        {
          let groupExists = muscleGroupMap.get(primariesToAdd);
          groupExists.primaryamount += 1
          muscleGroupMap.set(primariesToAdd, groupExists);
        }
        else
        {
          muscleGroupMap.set(primariesToAdd, { primaryamount: 1, secondaryamount: 1});
        }
      });
  
      selectedExcersize.secondaryTarget.forEach(secondariesToAdd => 
      {
        if(muscleGroupMap.has(secondariesToAdd))
        {
          let groupExists = muscleGroupMap.get(secondariesToAdd);
          groupExists.secondaryamount += 1
          muscleGroupMap.set(secondariesToAdd, groupExists);
        }
        else
        {
          muscleGroupMap.set(secondariesToAdd, { primaryamount: 1, secondaryamount: 1});
        }
      });
    });

    let primaryDataSet = Array.from(muscleGroupMap.values()).map(e => e.primaryamount);
    let secondaryDataSet  = Array.from(muscleGroupMap.values()).map(e => e.secondaryamount);

    let maxvalPrimarySet = Math.max(...primaryDataSet);
    let maxvalSecondarySet = Math.max(...secondaryDataSet);

    this.options = {
      scales: {
        r: {
          min: 0,
          max: maxvalPrimarySet >= maxvalSecondarySet?  maxvalPrimarySet : maxvalSecondarySet,
          beginAtZero: true,
          stepSize: 2,
          angleLines: {
            color: "red",
         },
       }
      }
    };

    this.dataSet = {
      labels: Array.from(muscleGroupMap.keys()),
      datasets: [
          {
              label: 'Primary Targets',
              data: primaryDataSet
          },
          {
              label: 'Secondary Targets',
              data: secondaryDataSet
          }
      ]
  };
  }
}
