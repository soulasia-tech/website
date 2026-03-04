import {format} from "date-fns";

export function calculateTotalGuests(adults: number, children: number): number {
    return adults + Math.floor(children / 2);
}

export function formatDateDay(dateString: string | undefined | null): string {
    if (!dateString) return '';
    try {
        return format(new Date(dateString), 'EEE, d MMMM yyyy');
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

export function formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '';
    try {
        return format(new Date(dateString), 'd MMMM yyyy');
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}
