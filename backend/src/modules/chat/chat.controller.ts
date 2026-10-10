import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('Live Chat & Messages')
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Initial skeleton - endpoints will be added step-by-step
}
