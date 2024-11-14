import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { QuestionService } from '../../../_services/question.service';
import { map, Observable, of } from 'rxjs';

export const HAS_NO_QUESTIONS = 'hasNoQuestions';

export function hasQuestionsValidator(questionService: QuestionService): AsyncValidatorFn {
    return (formGroup: AbstractControl): Observable<ValidationErrors | null> => {
        const topics = formGroup.get('topics')?.value;
        const difficulty = formGroup.get('difficulty')?.value;

        if (!(topics.length && difficulty)) {
            return of({ [HAS_NO_QUESTIONS]: true });
        }

        return questionService
            .getQuestionByParam(topics, difficulty)
            .pipe(map(res => (res.data?.length ? null : { [HAS_NO_QUESTIONS]: true })));
    };
}
