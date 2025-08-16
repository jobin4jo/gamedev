import { Component } from '@angular/core';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Gamemasterhub';
  isLoading = false;
  constructor(private loadingService: LoadingService) { }
  ngOnInit() {
    this.loadingService.loading$.subscribe(status => {
      this.isLoading = status;
    });
  }
}
