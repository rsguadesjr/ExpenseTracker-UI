export class AuthHelper {
  public static getMessage(e: any): string {
    // firebase error
    if (typeof e === 'object') {
      if (e.name === 'FirebaseError') {
        let message = e.message
          ?.replace('Firebase:', '')
          ?.replace(`(${e.code}).`, '');
        return message;
      }

      if (typeof e.error === 'string') {
        return e.error;
      }
    }

    console.log('Error', e);
    return 'An unexpected error was encountered.';
  }
}
