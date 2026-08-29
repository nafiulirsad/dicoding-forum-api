import { vi } from 'vitest';
import NewThread from '../../../Domains/threads/entities/NewThread.js';
import AddedThread from '../../../Domains/threads/entities/AddedThread.js';
import ThreadRepository from '../../../Domains/threads/ThreadRepository.js';
import AddThreadUseCase from '../AddThreadUseCase.js';

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
      owner: 'user-123',
    };

    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: 'sebuah thread',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = vi.fn(() => Promise.resolve(new AddedThread({
      id: 'thread-123',
      title: 'sebuah thread',
      owner: 'user-123',
    })));

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(new NewThread({
      title: 'sebuah thread',
      body: 'sebuah body thread',
      owner: 'user-123',
    }));
  });

  it('should throw error when payload is invalid', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.addThread = vi.fn(() => Promise.resolve());
    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });

    // Action & Assert
    await expect(addThreadUseCase.execute({ title: 'sebuah thread', owner: 'user-123' }))
      .rejects
      .toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    expect(mockThreadRepository.addThread).not.toBeCalled();
  });
});
