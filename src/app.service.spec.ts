import { AppService } from './app.service';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(() => {
    appService = new AppService();
  });

  it('should return library details', () => {
    const result = appService.getHello();
    expect(result).toEqual({
      title: 'Library',
      description:
        'A library management system where users can browse and borrow books, manage their accounts, and interact with library staff. The platform aims to provide a seamless experience for both library patrons and administrators.',
    });
  });
});