import { Test, TestingModule } from '@nestjs/testing';
import { promises as fs } from 'fs';
import * as path from 'path';
import { LoggingService } from './logging.service';

describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingService],
    }).compile();

    service = module.get<LoggingService>(LoggingService);
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('onModuleInit() creates the logs directory', async () => {
    const mkdirSpy = jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined as any);
    await service.onModuleInit();
    expect(mkdirSpy).toHaveBeenCalledWith(path.resolve(__dirname, '../../logs'), { recursive: true });
  });

  it('log() writes a line to the daily file and logs to console', async () => {
    const fixedNow = 1700000000000;
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

    const filePath = path.resolve(process.cwd(), 'test-log.log');
    const filePathSpy = jest.spyOn(service as any, 'getDailyFilePath').mockReturnValue(filePath);

    const appendSpy = jest.spyOn(fs, 'appendFile').mockResolvedValue(undefined as any);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const entry = {
      httpMethod: 'GET' as HttpMethod,
      level: 'INFO' as LogLevel,
      message: 'Test message',
      action: 'FETCH_ITEMS',
      status_response: 200,
    };

    service.log(entry);
    await (service as any).writeQueue;

    expect(filePathSpy).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledTimes(1);

    const [calledPath, calledLine, calledEncoding] = (appendSpy as jest.Mock).mock.calls[0];
    expect(calledPath).toBe(filePath);
    expect(calledEncoding).toBe('utf8');

    const parsed = JSON.parse(String(calledLine).trim());
    expect(parsed).toEqual({
      id: String(fixedNow),
      api: 'API_CATALOG',
      httpMethod: 'GET',
      action: 'FETCH_ITEMS',
      level: 'INFO',
      status_response: 200,
      message: 'Test message',
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      `level: ${entry.level},status_response: ${entry.status_response},action: ${entry.action}, httpMethod: ${entry.httpMethod}, message: ${entry.message}`,
    );
  });

  it('log() generates a string id based on Date.now', async () => {
    const fixedNow = 9876543210;
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow);

    jest.spyOn(service as any, 'getDailyFilePath').mockReturnValue(path.resolve(process.cwd(), 'test-log.log'));
    const appendSpy = jest.spyOn(fs, 'appendFile').mockResolvedValue(undefined as any);

    const entry = {
      level: 'INFO' as LogLevel,
      message: 'Another message',
      httpMethod: 'POST' as HttpMethod,
      action: 'CREATE_ITEM',
      status_response: 201,
    };

    service.log(entry);
    await (service as any).writeQueue;

    const calledLine = (appendSpy as jest.Mock).mock.calls[0][1] as string;
    const parsed = JSON.parse(String(calledLine).trim());
    expect(parsed.id).toBe(String(fixedNow));
  });

  it('log() queues multiple writes sequentially', async () => {
    jest.spyOn(service as any, 'getDailyFilePath').mockReturnValue(path.resolve(process.cwd(), 'test-log.log'));
    const appendSpy = jest.spyOn(fs, 'appendFile').mockImplementation(async () => {
      await new Promise((res) => setTimeout(res, 10));
      return undefined as any;
    });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(11111)
      .mockReturnValueOnce(22222);

    const entry1 = { level: 'WARNING' as LogLevel, message: 'First', httpMethod: 'GET' as HttpMethod, action: 'A1', status_response: 400 };
    const entry2 = { level: 'ERROR' as LogLevel, message: 'Second', httpMethod: 'POST' as HttpMethod, action: 'A2', status_response: 500 };

    service.log(entry1);
    service.log(entry2);

    await (service as any).writeQueue;

    expect(appendSpy).toHaveBeenCalledTimes(2);
    expect(consoleSpy).toHaveBeenCalledTimes(2);

    const line1 = (appendSpy as jest.Mock).mock.calls[0][1] as string;
    const line2 = (appendSpy as jest.Mock).mock.calls[1][1] as string;

    const parsed1 = JSON.parse(line1.trim());
    const parsed2 = JSON.parse(line2.trim());

    expect(parsed1.message).toBe('First');
    expect(parsed1.level).toBe('WARNING');
    expect(parsed1.id).toBe('11111');

    expect(parsed2.message).toBe('Second');
    expect(parsed2.level).toBe('ERROR');
    expect(parsed2.id).toBe('22222');
  });

  it('log() handles appendFile errors without throwing', async () => {
    jest.spyOn(service as any, 'getDailyFilePath').mockReturnValue(path.resolve(process.cwd(), 'test-log.log'));
    const appendSpy = jest.spyOn(fs, 'appendFile').mockRejectedValue(new Error('disk full'));

    const entry = { level: 'ERROR' as LogLevel, message: 'fail', httpMethod: 'PUT' as HttpMethod, action: 'A3', status_response: 503 };

    service.log(entry);
    await expect((service as any).writeQueue).resolves.toBeUndefined();
    expect(appendSpy).toHaveBeenCalledTimes(1);
  });

  it('log() does not log to console when consoleEnabled is false', async () => {
    (service as any).consoleEnabled = false;

    jest.spyOn(service as any, 'getDailyFilePath').mockReturnValue(path.resolve(process.cwd(), 'test-log.log'));
    jest.spyOn(fs, 'appendFile').mockResolvedValue(undefined as any);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const entry = { level: 'INFO' as LogLevel, message: 'silent', httpMethod: 'GET' as HttpMethod, action: 'A4', status_response: 200 };

    service.log(entry);
    await (service as any).writeQueue;

    expect(consoleSpy).not.toHaveBeenCalled();
  });
});