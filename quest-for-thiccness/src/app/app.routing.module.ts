import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

/**
 * Routes which this web app provoides, this is a top-to-bottom scheme 
 * meaning when a request comes in it will start from the top and return the first instance that matched the request.
 */
const routes: Routes = 
[  
   { path: '', component: HomeComponent },
   { path: 'home', component: HomeComponent },
]

@NgModule({  imports: [RouterModule.forRoot(routes)],  
             exports: [RouterModule]})
              
export class AppRoutingModule { }

/**
 * Instead of importing all the pages in app.module and then again importing them here
 * for Route configuration, we export these components here and then add the RoutingComponents in app.module
 * this way we do not have to add page-component imports in two different places.
 */
export const RoutingComponents = [  
    HomeComponent
]