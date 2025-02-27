import { environment } from '../environments/environment';

/**
 * Abstract class that serves as a base for API services.
 */
export abstract class ApiService {
    /**
     * The path for the specific resource, e.g. 'user', 'question', etc.
     * This property must be implemented by subclasses to specify the
     * endpoint path for the API resource they represent.
     */
    protected abstract apiPath: string;

    /**
     * Returns the full URL for the API endpoint based on
     * the specified apiPath.
     */
    get apiUrl(): string {
        return environment.apiUrl + this.apiPath;
    }
}
