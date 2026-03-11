import '@angular/compiler';

import { bootstrapApplication } from '@angular/platform-browser';
import { initializeApp } from 'firebase/app';

import { App } from './app/app';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

/* Firebase initialization */
initializeApp(environment.firebase);

/* Bootstrap Angular App */
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));