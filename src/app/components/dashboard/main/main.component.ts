import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SectiondService } from 'src/app/services/section.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy{
  sectionName: string = 'Section'
  subcription!: Subscription
  constructor(private sectionService: SectiondService) {}

  ngOnInit(): void {
    this.subcription = this.sectionService.sectionName$
      .subscribe((name: string) => { this.sectionName = name })
  }

  ngOnDestroy(): void {
    if(this.subcription) {
      this.subcription.unsubscribe()
    }
  }
}
