export function calculateTotalGuests(adults: number, children: number): number {
    return adults + Math.floor(children / 2);
} 
