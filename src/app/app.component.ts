import { Component } from '@angular/core';
import { AppsService } from './services/apps.service';
import { Configuration } from './models/configuration.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'meta-app-models';
  configurations: Configuration[] = [];
  selectedConfig?: Configuration;

  constructor(private appsService: AppsService) {
    this.selectedConfig = structuredClone(this.appsService.configs[0]);
  }

  ngOnInit(): void {
    this.configurations = this.appsService.configs;
  }

  onSelect(config: Configuration): void {
    this.selectedConfig = structuredClone(config);
  }

  getSelected(): Configuration {
    return this.selectedConfig;
  }
}
