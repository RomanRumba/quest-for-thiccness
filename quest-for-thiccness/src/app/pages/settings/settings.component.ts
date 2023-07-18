import { Component, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';
import { WhyareufragileComponent } from 'src/app/components/whyareufragile/whyareufragile.component';
import { Excersize } from 'src/app/models/excersize';
import { Program } from 'src/app/models/program';
import { CommonService } from 'src/app/services/commonService';
import { InsultService } from 'src/app/services/insultService';
import { ThemeService } from 'src/app/services/themeService';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  providers: [ DialogService, MessageService]
})
export class SettingsComponent 
{
  // Reference to the table in PrimeNG 
  @ViewChild('fileInput') fileInput: FileUpload | undefined;

  private ref: DynamicDialogRef | undefined;
  public selectedTheme: string | undefined;
  public selectedInsultSetting: string | undefined;
  public selectedDefaultPage: string | undefined;
  public customBankUrl: string | undefined;
  public selectedRestTimeSetting : string | undefined;

  constructor(public themeService: ThemeService,
              public insultService: InsultService,
              private messageService: MessageService,
              private dialogService: DialogService,
              public commonService: CommonService){}

  ngOnInit() 
  {
    this.selectedTheme = this.themeService.getMyCurrentTheme().themeName;
    this.selectedInsultSetting = this.insultService.isUserAPussy();
    this.selectedDefaultPage = this.commonService.getDefaultSettingForKey(this.commonService.DEFAULTPAGEKEY,"exercises");
    this.selectedRestTimeSetting = this.commonService.getDefaultSettingForKey(this.commonService.RESTCLOCKSETTING,"true");
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
  }

  changeInsultSetting(setting: string)
  {
    if(setting === 'false')
    {
      this.ref = this.dialogService.open(WhyareufragileComponent, 
        {
          header: 'Why are you so fragile?',
          // we dont want to let the user close this manully but rather add a confirm dialog.
          closable: true, 
          // This makes it look like 100% but its not because this 100% of the parrent
          width: '100%',
          contentStyle: {"overflow": "auto"},
          baseZIndex: 10000,
          maximizable: true,
        });
    }
    this.insultService.updateInsultsFlag(setting);
  }

  exportMyProgram()
  {
    let myExersizesToExport = this.commonService.getMyPrograms();
    if(myExersizesToExport.length === 0)
    {
      this.messageService.add({severity:'error', summary: 'No saved programs', detail: "You need to create some programs first before you can export them"});
      return;
    }
    var a = document.createElement('a');
    var file = new Blob([JSON.stringify(myExersizesToExport)], {type: "application/json"});
    a.href = URL.createObjectURL(file);
    a.download = "myPrograms";
    a.click();
  }

  // NOTE: PrimeNG has custom upload functionality but its bugged, It does not work
  // with this current version of TypeScript so just to keep it simple I use the FileUpload component only for selecting and accessing the file
  importProgram(event : any)
  {
    var reader = new FileReader();
    reader.onload = async (fileToRead: any) =>
    {
      let readFile: any[];
      try 
      {
        // Try to read the JSON file
        readFile = JSON.parse(fileToRead.target.result);
        if(!Array.isArray(readFile))
        {
          throw "File is not array";
        }

        let availableExersizes : Excersize[] = await this.commonService.getExersizes();

        // These are the keys that need to be checked
        let requiredKeysForPrograms = [ 'version', 'id', 'name', 'schedule', 'exesices'];
        let requiredKeysForExersizes = ['resourceUrl','exesiceID','isSetBased','notes','sets'];
        let requiredKeysForSets = [ 'setId', 'weightOrSec', 'repsOrMin', 'pause'];

        let amountOfProgramsAdded = 0;
        (<any>readFile).forEach((programToSave:any) => 
        {
          // Before creating the programs, we will check if all the keys in the object are correct
          // if they are not then we skip the object since the other objects can still be leagal 
          let checkAllKeysForPrograms = requiredKeysForPrograms.every((i) => programToSave.hasOwnProperty(i));
          if(checkAllKeysForPrograms === false)
          {
            return;
          }
          if(!Array.isArray(programToSave.schedule) || !Array.isArray(programToSave.exesices))
          {
            return;
          }
          if(!Array.isArray(programToSave.schedule))
          {
            return;
          }

          let exersizesThatAreValid: any[] = [];

          (<any>programToSave.exesices).forEach((exersizeToValidate: any) => {
            let checkAllKeysForExersizes = requiredKeysForExersizes.every((i) => exersizeToValidate.hasOwnProperty(i));
            if(checkAllKeysForExersizes === false)
            {
              return;
            }

            if(!Array.isArray(exersizeToValidate.sets) || availableExersizes.findIndex(e => e.id === exersizeToValidate.exesiceID) === -1)
            {
              return;
            }

            let setsThatAreValid : any[] = [];

            (<any>exersizeToValidate).sets.forEach((setToValidate: any) => 
            {
              let checkAllKeysForset = requiredKeysForSets.every((i) => setToValidate.hasOwnProperty(i));
              if(checkAllKeysForset === false)
              {
                return;
              }

              setsThatAreValid.push(setToValidate);
            });

            exersizeToValidate.sets = setsThatAreValid;
            exersizesThatAreValid.push(exersizeToValidate);
          });

          let programToImport: Program = {
            version: 0,
            id: this.commonService.generateUUID(),
            name: programToSave.name,
            schedule: programToSave.schedule,
            exesices: exersizesThatAreValid
          };

          this.commonService.saveNewProgram(programToImport);
          amountOfProgramsAdded++;
        });
        
        this.messageService.add({severity:'sucess', summary: 'Programs imported', detail: "Amount of programs imported : " + amountOfProgramsAdded + " out of " + readFile.length });
      } 
      catch (e) 
      {
        this.messageService.add({severity:'error', summary: 'Could not read file', detail: "The file you imported could not be read, please try another one"});
      }
      (<any>this.fileInput).clear();
    };

    reader.onerror = () =>
    {
      this.messageService.add({severity:'error', summary: 'Could not read file', detail: "The file you imported could not be read, please try another one"});
      (<any>this.fileInput).clear();
    }
    reader.readAsText(event.currentFiles[0]);
  }
}
