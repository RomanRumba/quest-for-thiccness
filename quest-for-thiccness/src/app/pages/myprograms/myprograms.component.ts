import { Component, ViewChild } from '@angular/core';
import {  MessageService,MenuItem, ConfirmationService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { ExcersizeComponent } from 'src/app/components/excersize/excersize.component';
import { ExcersizeformComponent } from 'src/app/components/excersizeform/excersizeform.component';
import { ExersizestatsComponent } from 'src/app/components/exersizestats/exersizestats.component';
import { ExcersizeformConfig } from 'src/app/models/modals/ExcersizeformConfig';
import { Program } from 'src/app/models/program';
import { CommonService } from 'src/app/services/commonService';

@Component({
  selector: 'app-myprograms',
  templateUrl: './myprograms.component.html',
  styleUrls: ['./myprograms.component.scss'],
  providers: [MessageService, DialogService,ConfirmationService]
})
export class MyprogramsComponent 
{
  // Reference to the popup component 
  private refToExersizeForm: DynamicDialogRef | undefined;
  private refToExersizeStarter: DynamicDialogRef | undefined;
  private refToExersizeStats: DynamicDialogRef | undefined;
  // Reference to the table in PrimeNG 
  @ViewChild('dt') dt: Table | undefined;
  // Contains the available commands in the speed dial component
  public actions: MenuItem[] = [];
  
  public myPrograms: Program[] = [];

  constructor(private commonService: CommonService,
              private messageService: MessageService,
              private dialogService: DialogService,
              private confirmationService: ConfirmationService) { }

  ngOnInit() 
  {
    this.myPrograms = this.commonService.getMyPrograms();
  }

  //This has to be of type any because typscript gets fucked up and does not understand event.target
  async confirmDelete(event: any, id: string) 
  {
    this.confirmationService.confirm({
        target: event.target,
        message: 'Are you sure that you want to delete this program?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => 
        { 
          try
          {
            this.myPrograms = this.commonService.deleteProgram(id);
            this.messageService.add({severity:'success', summary: 'Deleted', detail: "Program deleted"});
          }
          catch (err)
          {
            this.messageService.add({severity:'error', summary: 'Cannot delete', detail: "Could not delete, reason: "+err});
          }
        },
        reject: () => {}
    });
  }

  async updateProgram(id: string)
  {
    try
    {
      this.refToExersizeForm = this.dialogService.open(ExcersizeformComponent, {
        header: 'Update Program',
        // we dont want to let the user close this manully but rather add a confirm dialog.
        closable: false, 
        width: this.commonService.getWithForModal(),
        contentStyle: {"overflow": "auto"},
        baseZIndex: 10000,
        maximizable: true,
        data: 
        <ExcersizeformConfig><unknown>{
          flag: 2,
          excersizes: await this.commonService.getExcersizesInProgram(id),
          program: this.myPrograms.find(t => t.id === id)
        }
      });
  
      this.refToExersizeForm.onClose.subscribe((product) =>
      {
        if(product !== null)
        {
          this.messageService.add({severity:'success', summary: 'Updated', detail: "Program updated"});
        }
      });
    }
    catch(err)
    {
      this.messageService.add({severity:'error', summary: 'Cannot update', detail: "Could not open program, reason :"+err});
    }
  }

  async startProgram(id: string)
  {
    let programToStart = this.myPrograms.find(t => t.id === id);
    
    this.refToExersizeStarter = this.dialogService.open(ExcersizeComponent, {
      header: programToStart?.name,
      // we dont want to let the user close this manully but rather add a confirm dialog.
      closable: true, 
      width: this.commonService.getWithForModal(),
      height: '100vh',
      contentStyle: {"overflow": "auto", 'padding':'0em'},
      baseZIndex: 10000,
      maximizable: true,
      data: 
      <ExcersizeformConfig><unknown>{
        flag: 0, // we reuse the ExcersizeformConfig but we do not need the flag
        excersizes: await this.commonService.getExcersizesInProgram(id),
        program: programToStart
      }
    });

    this.refToExersizeStarter.onClose.subscribe((product) =>
    {

    });
  }

  async showStatsForProgram(id: string)
  {
    let programToGetStatsFor = this.myPrograms.find(t => t.id === id);
    
    this.refToExersizeStats = this.dialogService.open(ExersizestatsComponent, {
      header: "Statistics for " + programToGetStatsFor?.name,
      closable: true, 
      width: this.commonService.getWithForModal(),
      contentStyle: {"overflow": "auto", 'padding':'0em'},
      baseZIndex: 10000,
      maximizable: true,
      data: 
      <ExcersizeformConfig><unknown>{
        flag: 0, // we reuse the ExcersizeformConfig but we do not need the flag
        excersizes: await this.commonService.getExcersizesInProgram(id),
        program: programToGetStatsFor
      }
    });

    this.refToExersizeStats.onClose.subscribe((product) =>
    {

    });
  }
}
