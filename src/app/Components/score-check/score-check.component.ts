import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from 'src/app/services/game.service';
import { LoadingService } from 'src/app/services/loading.service';

declare const BarcodeDetector: any;

@Component({
  selector: 'app-score-check',
  templateUrl: './score-check.component.html',
  styleUrls: ['./score-check.component.scss']
})
export class ScoreCheckComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  userNumber = '';
  userData: any;
  totalScore: any = 0;
  isScanning: boolean = false;
  scannerError: string = '';
  cameraStream: MediaStream | null = null;
  private scanInterval: any = null;

  constructor(
    private loader: LoadingService,
    private service: GameService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Check URL query parameters for auto-check (e.g. /score-check?player=12 or /score-check?userNumber=12)
    this.route.queryParams.subscribe(params => {
      const num = params['player'] || params['userNumber'] || params['number'] || params['id'];
      if (num) {
        this.userNumber = String(num).trim();
        this.checkScore();
      }
    });
  }

  checkScore(): void {
    if (!this.userNumber) return;
    this.loader.show();
    this.totalScore = 0;
    this.service.searchUser(this.userNumber).subscribe({
      next: (res: any) => {
        this.userData = res && res[0] ? res[0] : (Array.isArray(res) ? null : res);
        if (this.userData?.games) {
          for (let g of this.userData.games) {
            this.totalScore += g.points || 0;
          }
        }
        this.loader.hide();
      },
      error: () => {
        this.loader.hide();
        this.userData = null;
      }
    });
  }

  onInputChange(): void {
    if (!this.userNumber || this.userNumber.trim() === '') {
      this.userData = null;
      this.totalScore = 0;
    }
  }

  /* ── Browser Camera QR Scanner ── */
  async toggleScanner(): Promise<void> {
    if (this.isScanning) {
      this.stopScanner();
    } else {
      await this.startScanner();
    }
  }

  async startScanner(): Promise<void> {
    this.scannerError = '';
    this.isScanning = true;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });

      // Allow DOM to render the video element before attaching
      setTimeout(() => {
        if (this.videoElement && this.videoElement.nativeElement) {
          const video = this.videoElement.nativeElement;
          video.srcObject = this.cameraStream;
          video.setAttribute('playsinline', 'true');
          video.play().then(() => {
            this.beginScanningLoop();
          }).catch(err => {
            this.scannerError = 'Could not start camera video stream.';
          });
        }
      }, 100);
    } catch (err: any) {
      this.scannerError = err?.message || 'Camera permission denied or camera unavailable.';
      this.isScanning = false;
    }
  }

  stopScanner(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    this.isScanning = false;
  }

  private beginScanningLoop(): void {
    const hasBarcodeDetector = typeof BarcodeDetector !== 'undefined';
    let barcodeDetector: any = null;

    if (hasBarcodeDetector) {
      try {
        barcodeDetector = new BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13', 'upc_a'] });
      } catch (e) {
        barcodeDetector = null;
      }
    }

    this.scanInterval = setInterval(async () => {
      if (!this.videoElement || !this.videoElement.nativeElement) return;
      const video = this.videoElement.nativeElement;
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

      try {
        if (barcodeDetector) {
          const barcodes = await barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            this.handleScanResult(rawValue);
          }
        }
      } catch (err) {
        // Continue detection on next frame
      }
    }, 400);
  }

  private handleScanResult(scannedText: string): void {
    if (!scannedText) return;
    this.stopScanner();

    // Parse scanned result (e.g. url https://.../score-check?player=12 or raw number "12")
    let extractedNumber = scannedText.trim();
    try {
      if (extractedNumber.includes('?')) {
        const url = new URL(extractedNumber);
        const playerParam = url.searchParams.get('player') || url.searchParams.get('userNumber') || url.searchParams.get('number');
        if (playerParam) {
          extractedNumber = playerParam;
        }
      } else if (extractedNumber.includes('/')) {
        const parts = extractedNumber.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart && !isNaN(Number(lastPart))) {
          extractedNumber = lastPart;
        }
      }
    } catch (e) {
      // Use raw text
    }

    this.userNumber = extractedNumber;
    this.checkScore();
  }

  ngOnDestroy(): void {
    this.stopScanner();
  }
}
