import { Component } from '@angular/core';
import { CommonService } from 'src/app/services/commonService';

@Component({
  selector: 'app-virgin',
  templateUrl: './virgin.component.html',
  styleUrls: ['./virgin.component.scss']
})
export class VirginComponent 
{
  constructor(public commonService: CommonService) { }

 // At the moment we dont need anything from this component. just plain html
}
