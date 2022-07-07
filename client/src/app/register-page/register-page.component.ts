import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MaterialService } from '../shared/classes/material.service';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent implements OnInit, OnDestroy {

  public form: FormGroup;
  public aSub: Subscription;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(
        null,
        [Validators.required, Validators.email]
      ),
      password: new FormControl(
        null,
        [Validators.required,Validators.minLength(6)]
      )
    });
  }

  public onSubmit() {
    this.form.disable();
    this.aSub = this.auth.register(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/login'], {
          queryParams: {
            registered: true,
          }
        });
      },
      error: (e) => {
        MaterialService.toast(e.error.message);
        this.form.enable();
      }
    });
  }

  public ngOnDestroy(): void {
    if (this.aSub) {
      this.aSub.unsubscribe();
    }
  }
}
