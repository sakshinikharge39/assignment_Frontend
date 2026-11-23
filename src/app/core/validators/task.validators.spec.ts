import { FormControl } from '@angular/forms';
import {
  trimmedMaxLengthValidator,
  trimmedMinLengthValidator,
  trimmedRequiredValidator
} from './task.validators';

describe('Task Custom Trimmed Validators', () => {
  describe('trimmedRequiredValidator', () => {
    const validator = trimmedRequiredValidator();

    it('should fail when value is null or undefined', () => {
      expect(validator(new FormControl(null))).toEqual({ required: true });
      expect(validator(new FormControl(undefined))).toEqual({ required: true });
    });

    it('should fail when value is an empty string', () => {
      expect(validator(new FormControl(''))).toEqual({ required: true, whitespaceOnly: true });
    });

    it('should fail when value is only whitespace', () => {
      expect(validator(new FormControl('   '))).toEqual({ required: true, whitespaceOnly: true });
      expect(validator(new FormControl('\t\n  '))).toEqual({ required: true, whitespaceOnly: true });
    });

    it('should pass when value contains non-whitespace characters', () => {
      expect(validator(new FormControl('Valid Title'))).toBeNull();
      expect(validator(new FormControl('  Valid Title  '))).toBeNull();
    });
  });

  describe('trimmedMinLengthValidator', () => {
    const validator = trimmedMinLengthValidator(3);

    it('should return null for null/undefined (delegated to required validator)', () => {
      expect(validator(new FormControl(null))).toBeNull();
      expect(validator(new FormControl(undefined))).toBeNull();
    });

    it('should fail when trimmed length is less than 3', () => {
      const control = new FormControl('  ab  ');
      const result = validator(control);
      expect(result).toEqual({
        minlength: {
          requiredLength: 3,
          actualLength: 2
        }
      });
    });

    it('should pass when trimmed length is equal to or greater than 3', () => {
      expect(validator(new FormControl('abc'))).toBeNull();
      expect(validator(new FormControl('  abc  '))).toBeNull();
      expect(validator(new FormControl('Longer task title'))).toBeNull();
    });
  });

  describe('trimmedMaxLengthValidator', () => {
    const validator = trimmedMaxLengthValidator(10);

    it('should pass when trimmed length is within limit', () => {
      expect(validator(new FormControl('short'))).toBeNull();
      expect(validator(new FormControl('0123456789'))).toBeNull();
      expect(validator(new FormControl('  0123456789  '))).toBeNull();
    });

    it('should fail when trimmed length exceeds limit', () => {
      const control = new FormControl('This is too long for 10 chars');
      const result = validator(control);
      expect(result).not.toBeNull();
      expect(result?.['maxlength'].requiredLength).toBe(10);
    });
  });
});
