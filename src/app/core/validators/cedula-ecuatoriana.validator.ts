
import {
    AbstractControl,
    ValidationErrors,
    ValidatorFn
} from '@angular/forms';

export function cedulaEcuatorianaValidator(): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {

        const cedula = control.value;

        // Permitir que Validators.required gestione los campos vacíos.
        if (!cedula) {
        return null;
        }

        // Comprobar que tenga exactamente 10 dígitos.
        if (!/^\d{10}$/.test(cedula)) {
        return { cedulaFormato: true };
        }

        // Comprobar el código de provincia.
        const provincia = Number(cedula.substring(0, 2));

        if (provincia < 1 || provincia > 24) {
        return { cedulaProvincia: true };
        }

        // Comprobar que corresponda a una persona natural.
        const tercerDigito = Number(cedula.charAt(2));

        if (tercerDigito > 5) {
        return { cedulaTercerDigito: true };
        }

        // Coeficientes utilizados por el algoritmo.
        const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];

        let suma = 0;

        // Calcular la suma de los primeros nueve dígitos.
        for (let i = 0; i < 9; i++) {

        let resultado =
            Number(cedula.charAt(i)) * coeficientes[i];

        if (resultado >= 10) {
            resultado -= 9;
        }

        suma += resultado;
        }

        // Obtener el dígito verificador esperado.
        const residuo = suma % 10;

        const digitoVerificador =
        residuo === 0 ? 0 : 10 - residuo;

        // Comparar con el último dígito de la cédula.
        const ultimoDigito = Number(cedula.charAt(9));

        if (digitoVerificador !== ultimoDigito) {
        return { cedulaInvalida: true };
        }

        // La cédula superó todas las validaciones.
        return null;
    };
    }
