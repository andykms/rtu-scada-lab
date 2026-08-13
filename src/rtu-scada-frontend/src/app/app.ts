import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaperTextfield, PaperInput, PaperLabel, PaperButton,PaperDataList } from "../paper-ui/base"
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


export type TStudentInfo = {
  fio: {
    firstName: string
    lastName: string
  },
  age: number
}


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PaperTextfield, PaperInput,PaperLabel, PaperButton, PaperDataList, FormsModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly fb = inject(FormBuilder)

  protected readonly form = this.fb.group({
    searchS: this.fb.control<string>(''),
    searchM: this.fb.control<string>(''),
    searchL: this.fb.control<string>(''),
    student: this.fb.control<TStudentInfo|null>(null)
  })

  protected readonly value = ""

  protected readonly variants = [
    'Apple',
    'Banana',
    'Cherry',
    'Durian',
    'Elderberry',
    'Fig',
    'Grape',
    'Honeydew',
    'Iceberg',
    'Jackfruit',
    'Kiwi',
    'Lemon',
    'Mango',
    'Nectarine',
    'Orange',
    'Papaya',
    'Quince',
    'Raspberry',
    'Strawberry',
    'Tangerine',
    'Ugli Fruit',
    'Vanilla',
    'Very long fruit, its name is very long'
  ]

  protected readonly students = [
    {
      fio: {
        firstName: 'John',
        lastName: 'Doe'
      },
      age: 25
    },
    {
      fio: {
        firstName: 'Jane',
        lastName: 'Doe'
      },
      age: 30
    },
    {
      fio: {
        firstName: 'Jim',
        lastName: 'Smith'
      },
      age: 35
    },
    {
      fio: {
        firstName: 'Jill',
        lastName: 'Smith'
      },
      age: 40
    }
  ]

  readonly studentResolver = (student: TStudentInfo | null) => student ? `${student.fio.firstName} ${student.fio.lastName}` : "-"
}
