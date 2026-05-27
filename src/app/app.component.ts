import { Component, ElementRef, ViewChild, OnInit, HostListener } from '@angular/core';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('imageToPredict') imageElement!: ElementRef<HTMLImageElement>;
  
  predictions: any[] = [];
  isModelLoading = true;
  imageUrl: string | null = null;
  model: any;

  async ngOnInit() {
    this.model = await mobilenet.load();
    this.isModelLoading = false;
  }

  // ฟังก์ชันดักจับการกด Ctrl+V (วางรูป)
  @HostListener('window:paste', ['$event'])
  handlePaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            this.processImage(blob);
          }
        }
      }
    }
  }

  // ฟังก์ชันเลือกไฟล์ผ่านปุ่ม (เหลือแค่อันเดียวพอครับ)
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processImage(file);
    }
  }

  // ฟังก์ชันหลักในการจัดการไฟล์รูปภาพ
  processImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
      // ให้เวลา HTML Render รูปแป๊บหนึ่งก่อนสั่ง AI ทายผล
      setTimeout(() => this.runAI(), 200);
    };
    reader.readAsDataURL(file);
  }

  async runAI() {
    if (this.model && this.imageElement) {
      const img = this.imageElement.nativeElement;
      if (img.complete) {
        const results = await this.model.classify(img);
        this.predictions = results;
      } else {
        img.onload = async () => {
          const results = await this.model.classify(img);
          this.predictions = results;
        };
      }
    }
  }

  resetUpload() {
    this.imageUrl = null;
    this.predictions = [];
  }
}