import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MaterialService } from 'src/app/shared/classes/material.service';
import { Category } from 'src/app/shared/interfaces';
import { CategoriesService } from 'src/app/shared/services/categories.service';

@Component({
  selector: 'app-categories-form',
  templateUrl: './categories-form.component.html',
  styleUrls: ['./categories-form.component.css']
})
export class CategoriesFormComponent implements OnInit {

  @ViewChild('input') inputRef: ElementRef;

  public form: FormGroup;
  public image: File;
  public imagePreview;
  public isNew: boolean = true;
  public category: Category;

  constructor(
    private route: ActivatedRoute,
    private categoriesService: CategoriesService,
    private router: Router,
  ) { }

  public ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
    });

    this.form.disable();

    this.route.params
      .pipe(
        switchMap((params: Params) => {
          if (params['id']) {
            this.isNew = false;
            return this.categoriesService.getById(params['id']);
          }

          return of(null)
        })
      ).subscribe({
        next: (category: Category) => {
          if (category) {
            this.category = category;
            this.form.patchValue({
              name: category.name,
            });
            this.imagePreview = category.imageSrc;
            MaterialService.updateTextInputs();
          }
          this.form.enable();
        },
        error: (error) => MaterialService.toast(error.error.message)
      });
  }

  public triggerClick() {
    this.inputRef.nativeElement.click();
  }

  public onFileUpload(event: any) {
    const file = event.target.files[0];
    this.image = file;

    const reader = new FileReader()

    reader.onload = () => {
      this.imagePreview = reader.result;
    };

    reader.readAsDataURL(file);
  }

  public onSubmit() {
    let obs$;
    this.form.disable();

    if (this.isNew) {
      obs$ = this.categoriesService.create(this.form.value.name, this.image);
    } else {
      obs$ = this.categoriesService.update(this.category._id, this.form.value.name, this.image);
    }
    obs$.subscribe({
      next: (category) => {
        this.category = category;
        MaterialService.toast('Изменения сохранены.')
        this.form.enable();
      },
      error: (error) => {
        MaterialService.toast(error.error.message);
        this.form.enable();
      }
    });
  }

  public deleteCategory() {
    const decision = window.confirm(`Вы уверены, что хотите удалить категорию "${this.category.name}"`);

    if (decision) {
      this.categoriesService.delete(this.category._id)
        .subscribe({
          next: (response) => MaterialService.toast(response.message),
          error: (error) => MaterialService.toast(error.error.message),
          complete: () => this.router.navigate(['/categories']),
        });
    }
  }
}
