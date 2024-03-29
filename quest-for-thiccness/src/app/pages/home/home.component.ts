import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Table } from 'primeng/table';
import { ExcersizeformComponent } from 'src/app/components/excersizeform/excersizeform.component';
import { ExerciseListComponent } from 'src/app/components/exercise-list/exercise-list.component';
import { VirginComponent } from 'src/app/components/virgin/virgin.component';
import { Excersize } from 'src/app/models/excersize';
import { ExcersizeformConfig } from 'src/app/models/modals/ExcersizeformConfig';
import { CommonService } from 'src/app/services/commonService';
import { InsultService } from 'src/app/services/insultService';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [MessageService, DialogService]
})
export class HomeComponent implements OnDestroy
{
  // Reference to the popup component 
  private ref: DynamicDialogRef | undefined;
  private virginref : DynamicDialogRef | undefined;
  private updateRef : DynamicDialogRef | undefined;
  // Reference to the table in PrimeNG 
  @ViewChild('dt') dt: Table | undefined;
  
  // All of the systems excersizes
  public excersizes: Excersize[] = [];
  // Contains the available commands in the speed dial component
  public actions: MenuItem[] = [];

  // Contains all the excersizes that the user has selected
  // this will be used based on that action was chosen by the user
  public selectedExcersizes: Excersize[] = [];

  // Search functionality
  public selectedSearchField: any = { field: "name" , target: "name"};
  public currentSearchString: string = "";
  public searchAbleExersizeFields: any[] = 
  [
    {
      field: "name",
      target: "name" 
    },
    {
      field: "primary targets",
      target: "target" 
    },
    {
      field: "secondary targets",
      target: "secondaryTarget" 
    }
  ];
 
  public selectedPushPullSearch: any = { field: "All" , value: ""};
  public pushPullSearh: any[] = 
  [
    {
      field: "All",
      value: "" 
    },
    {
      field: "Push",
      value: "push" 
    },
    {
      field: "Pull",
      value: "pull" 
    },
    {
      field: "Neither",
      value: "neither" 
    },
  ];

  constructor(private commonService: CommonService,
              private messageService: MessageService,
              private dialogService: DialogService,
              public insultService: InsultService) { }

  ngOnInit() 
  {
    this.commonService.getExersizes().then((res: Excersize[]) => { this.excersizes = res; });
    this.actions =
    [
      {  
        icon: 'pi pi-trash',
        tooltip: 'Clear', tooltipPosition: 'left',
        command: () => { this.selectedExcersizes = []; } 
      },
      {  
        icon: 'pi pi-plus',
        tooltip: 'Add', tooltipPosition: 'left',
        command: () => { this.openNewExesize(); } 
      },
      {
        icon: 'pi pi-pencil',
        tooltip: 'Clear', tooltipPosition: 'left',
        command: () => { this.addExercisesToExistingProgram(); } 
      }
   ];

   if(this.commonService.isThisMyFirstTime())
   {
    this.virginref = this.dialogService.open(VirginComponent, 
      {
        header: 'First Time?',
        // we dont want to let the user close this manully but rather add a confirm dialog.
        closable: true, 
        // This makes it look like 100% but its not because this 100% of the parrent
        width: this.commonService.getWithForModal(),
        height: '100vh',
        contentStyle: {"overflow": "auto"},
        baseZIndex: 10000,
        maximizable: true,
        data: null
      });
  
      // when the modal closes, if this component recives new Exercise
      // then it means the user created a new program
      this.virginref.onClose.subscribe((isNoLongerVirgin) =>
      {
        this.commonService.setFirstTimeDone();
      });
   }
  }

  // Have to implment the on Destroy because this component
  // can open modals with other components, need to ensure
  // that those components are disposed of properly
  ngOnDestroy() 
  {
    // need to destroy the pop-up if it exists
    if (this.ref) 
    {
      this.ref.close();
    }
    if(this.virginref)
    {
      this.virginref.close();
    }
    if(this.updateRef)
    {
      this.updateRef.close();
    }
  }

  // Simple function that clears the search functionality in the table component
  clearSearch()
  {
    this.currentSearchString = "";
    this.dt?.clear();
    this.applyPushPullFilter();
  }

  // calls the filter function of the table component with specific search parameters
  applyFilterGlobal($event :Event, searchCommand : string) 
  {
    if(this.selectedSearchField.target === "target" || this.selectedSearchField.target === "secondaryTarget")
    {
      let valuSplitted = ($event.target as HTMLInputElement).value.trim().split(" ");
      valuSplitted.forEach(searchCom => 
      {
        this.dt?.filter(searchCom, this.selectedSearchField.target, searchCommand);
      });
    }
    else
    {
      this.dt?.filter(($event.target as HTMLInputElement).value, this.selectedSearchField.target, searchCommand);
    }
  }

  applyPushPullFilter()
  {
    this.dt?.filter(this.selectedPushPullSearch.value, "pushPull", "contains");
  }

  // checks if the user has selected any exersizes and if they did
  // it will open a new modal with ExcersizeformComponent component
  // and pass it the selected exersizes
  openNewExesize()
  {
    if(this.selectedExcersizes.length <= 0)
    {
      this.messageService.add({severity:'error', summary: 'no exercises selected', detail: this.insultService.insultOn? this.insultService.getRandomInsultType(1) :"please select exercises from the 'available exercises' to create a new program."});
      return;
    }
    
   
    this.ref = this.dialogService.open(ExcersizeformComponent, 
    {
      header: 'New program',
      // we dont want to let the user close this manully but rather add a confirm dialog.
      closable: false, 
      // This makes it look like 100% but its not because this 100% of the parrent
      width: this.commonService.getWithForModal(),
      height: '100vh',
      contentStyle: {"overflow": "auto"},
      baseZIndex: 10000,
      maximizable: true,
      data: 
      <ExcersizeformConfig><unknown>{
        flag: 1,
        excersizes: this.selectedExcersizes,
        program: null
      }
    });

    // when the modal closes, if this component recives new Exercise
    // then it means the user created a new program
    this.ref.onClose.subscribe((newExercise) =>
    {
      this.selectedExcersizes = [];
      if(newExercise !== null)
      {
        this.messageService.add({severity:'success', summary: 'Created', detail: "New program created! visit 'My Programs' to see your programs"});
      }
    });
  }

  addExercisesToExistingProgram()
  {
    if(this.selectedExcersizes.length <= 0)
    {
      this.messageService.add({severity:'error', summary: 'no exercises selected', detail: this.insultService.insultOn? this.insultService.getRandomInsultType(1) :"please select exercises from the 'available exercises'"});
      return;
    }
    
    this.updateRef = this.dialogService.open(ExerciseListComponent, 
    {
      header: 'Update a program',
      closable: true, 
      // This makes it look like 100% but its not because this 100% of the parrent
      width: this.commonService.getWithForModal(),
      height: '100vh',
      contentStyle: {"overflow": "auto"},
      baseZIndex: 10000,
      maximizable: true,
      data: 
      <ExcersizeformConfig><unknown>{
        flag: 1,
        excersizes: this.selectedExcersizes,
        program: null
      }
    });

    // when the modal closes, if this component recives new Exercise
    // then it means the user created a new program
    this.updateRef.onClose.subscribe((options : {updatedID: string, ShouldOpenUpdateForm: boolean}) =>
    {
      this.selectedExcersizes = [];

      if(typeof(options) !== "undefined")
      {
        this.messageService.add({severity:'success', summary: 'Updated', detail: "Program updated succesfully"});
      }
    });
  }
}
