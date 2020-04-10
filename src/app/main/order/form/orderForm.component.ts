import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { fuseAnimations } from '@fuse/animations';

import { Location } from '@angular/common';

import { locale as english } from '../i18n/en';
import { locale as thai } from '../i18n/th';

import { OrderService } from '../services/order.service';
import { InvolvedpartyService } from './../../involvedparty/services/involvedparty.service';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material';
import { CarAndDateComponent } from '../car-and-date/car-and-date.component';

@Component({
  selector: 'app-order-form',
  templateUrl: './orderForm.component.html',
  styleUrls: ['./orderForm.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class OrderFormComponent implements OnInit {

  orderData: any = {};
  vehicleData: Array<any> = [];
  markersData: Array<any> = [];

  sideNaveOpened: Boolean;

  markersSelected: Array<any> = [];

  zoom: number = 10;
  lat: number = 13.6186285;
  lng: number = 100.5078163;

  constructor(
    private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    private location: Location,
    private orderService: OrderService,
    private involvedpartyService: InvolvedpartyService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog
  ) {
    this._fuseTranslationLoaderService.loadTranslations(english, thai);
  }


  ngOnInit(): void {

    this.orderData = this.route.snapshot.data.items
      ? this.route.snapshot.data.items.data
      : {
        "docno": "",
        "docdate": "",
        "carNo": "",
        "cusAmount": null,
        "orderStatus": "draft"
      };
    console.log(this.orderData);

    this.getVehicleData();
    this.getMarkerData();

  }

  getVehicleData() {
    this.orderService.getVehicleData().then((res) => {
      this.vehicleData = res;
      this.openCarAndDate();
      this.spinner.hide();
    }).catch((err) => {
      console.log(err);
      this.spinner.hide();
    })
  }

  openCarAndDate(): void {
    const dialogRef = this.dialog.open(CarAndDateComponent, {
      width: '350px',
      disableClose: true,
      data: { carNo: this.orderData.carNo, docdate: this.orderData.docdate, cars: this.vehicleData }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.orderData.carNo = result.carNo
        this.orderData.docdate = result.docdate
      }
    });
  }

  getMarkerData() {
    this.involvedpartyService.getInvolvedpartyDataList().subscribe((res: any) => {
      this.markersData = res.data;
      // console.log(this.markersData);
    });
  }

  clickedMarker(item: any, index: number) {
    let mIndex = this.markersSelected.findIndex((el) => {
      return el._id === item._id
    });
    // console.log(mIndex)

    if (mIndex === -1) {
      this.markersSelected.push(item);
    }
    // console.log(this.markersSelected);
    // console.log(this.markersSelected.length);

    if (this.markersSelected.length > 0) {
      this.sideNaveOpened = true;
    };
  }

  onDeleteList(index) {
    this.markersSelected.splice(index, 1);
    if (this.markersSelected.length === 0) {
      this.sideNaveOpened = false;
    }
  }

  goBack() {
    this.spinner.show();
    this.location.back();
  }

  async onSave() {
    this.spinner.show();

    console.log(this.orderData)

    if (this.orderData._id) {
      this.orderService
        .updateOrderData(this.orderData._id, this.orderData)
        .then(res => {
          // console.log(res);
          this.location.back();
        })
        .catch(err => {
          this.spinner.hide();
        });
    } else {
      this.orderService
        .createOrderData(this.orderData)
        .then(() => {
          this.location.back();
        })
        .catch(err => {
          this.spinner.hide();
        });
    }

  }


}
