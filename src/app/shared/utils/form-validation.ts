import { ValidatorFn, AbstractControl, FormGroup } from '@angular/forms';

export class FormValidation {
  static matchRegexValidator(pattern: RegExp, error: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const valid = pattern.test(control.value);
      return !valid ? { error } : null;
    };
  }

  static requiredValidator(error: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value?.trim();
      return !value ? { error } : null;
    };
  }

  static minLengthValidator(minLength: number, error: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value ?? '';
      return value.length < minLength ? { error } : null;
    };
  }

  static maxLengthValidator(maxLength: number, error: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value ?? '';
      return value.length > maxLength ? { error } : null;
    };
  }

  //
  static passwordCompareValidator({compareKey1, compareKey2, controlKey, error} : {compareKey1: string, compareKey2: string, error: string, controlKey?: string }): ValidatorFn {
    controlKey = controlKey || 'root';
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value1 = control.get(compareKey1);
      const value2 = control.get(compareKey2);
      return value1?.value != value2?.value ? { [controlKey!]: error } : null;
    };
  }

  static getFormValidationErrors(form: FormGroup): { [key: string]: string[] }  {
    const result: any = {};
    const formErrors = Object.assign({}, form.errors);
    if (formErrors != null) {
      Object.keys(formErrors).forEach((keyError) => {
        result[keyError] = [formErrors[keyError]];
      });
    }

    Object.keys(form.controls).forEach((key) => {
      const controlErrors = form.get(key)?.errors;
      result[key] = result[key] ?? [];
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          result[key].push(controlErrors[keyError]);
        });
      }
    });

    return result;
  }
}
