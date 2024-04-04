import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RestApiService } from 'src/app/services/rest-api.service';
import { ROUTES_API } from 'src/app/utilities/constants';

@Component({
  selector: 'app-images',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit, OnDestroy{
  subscription!: Subscription
  images: string[] = []
  imgDamaged: string[] = []
  inventory!: any
  pathImgs: string = ROUTES_API.images
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resApi: RestApiService
  ) {}

  ngOnInit() {
    this.subscription = this.route.params.subscribe((data: any) => {
      if(data['inventoryId']) {
        this.loadImages(data['inventoryId'])
      }
    })
  }

  ngOnDestroy(): void {
    if(this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  backTo() {
    this.router.navigate(['main/inventory'])
  }

  loadImages(id: number) {
    this.resApi.get(ROUTES_API.inventory + 'images/'+id).subscribe((response) => {
      if(response.error) {
        this.router.navigate(['main/home'])
      }
      if(response.data) {
        this.images = response.data.images
        this.imgDamaged = response.data.imgDamaged
        this.inventory = response.data.inventory
      }
    })
  }
}
