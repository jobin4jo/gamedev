import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Modal } from 'bootstrap';
@Component({
  selector: 'app-registeration-dashboard',
  templateUrl: './registeration-dashboard.component.html',
  styleUrls: ['./registeration-dashboard.component.scss']
})
export class RegisterationDashboardComponent {
 playerForm!: FormGroup;
  registrationNo: string = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.playerForm = this.fb.group({
      playerName: ['', Validators.required],
      place: ['', Validators.required],
      amountPaid: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.playerForm.valid) {
      // Simulate backend call
      this.registrationNo = Math.floor(Math.random() * 10000).toString();

      // Show modal
      const modalElement = document.getElementById('regModal');
      if (modalElement) {
        const modalInstance = new Modal(modalElement);
        modalInstance.show();
      }

      // Reset form after submit
      this.playerForm.reset();
    }
}
}
