import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates that the input is not empty or just whitespace.
 */
export function trimmedRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined) {
      return { required: true };
    }
    const str = String(value).trim();
    if (str.length === 0) {
      return { required: true, whitespaceOnly: true };
    }
    return null;
  };
}

/**
 * Validates that the trimmed string has at least `min` characters.
 */
export function trimmedMinLengthValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined) {
      return null; // Let required validator handle null/empty
    }
    const trimmed = String(value).trim();
    if (trimmed.length > 0 && trimmed.length < min) {
      return {
        minlength: {
          requiredLength: min,
          actualLength: trimmed.length
        }
      };
    }
    return null;
  };
}

/**
 * Validates that the trimmed string has at most `max` characters.
 */
export function trimmedMaxLengthValidator(max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined) {
      return null;
    }
    const trimmed = String(value).trim();
    if (trimmed.length > max) {
      return {
        maxlength: {
          requiredLength: max,
          actualLength: trimmed.length
        }
      };
    }
    return null;
  };
}
