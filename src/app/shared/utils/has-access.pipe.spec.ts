import { HasAccessPipe } from './has-access.pipe';

describe('HasAccessPipe', () => {
  it('create an instance', () => {
    const pipe = new HasAccessPipe();
    expect(pipe).toBeTruthy();
  });
});
