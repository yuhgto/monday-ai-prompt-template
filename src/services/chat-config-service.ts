// import { AiChatAction, AiClient } from '@mondaydotcomorg/react-hooks';
// import { _t } from '@mondaydotcomorg/trident-runtime';
// import { BaseChatAppConfigService } from '../base-config-service';
// import { FORMULA_ASSISTANT } from 'constants/app_routes';
// import { AppChatConfigService } from 'types';
// import { AppDimension } from 'constants/app-dimensions';

type AppDimension = {
  height: number | string;
  width: number;
};

interface MessageAction {
  onClick: (messageContent: string) => void;
  icon: unknown;
}

export default class ChatAppConfigService {
  assistantMessagesAction(): MessageAction | undefined {
    return undefined;
  }

  static source(): string {
    return "base_chat_app";
  }

  containerStyle(): AppDimension {
    return {
      width: 300,
      height: 320,
    };
  }

  placeholder(): string {
    return "loading...";
  }

  inputPlaceholder(): string {
    return "Type a message...";
  }

  static engine(): string {
    return "open_ai";
  }

  static action(): string {
    return "chat";
  }

  primaryButtonText(): string {
    return "generate an API call";
  }

  static primaryButtonAction(_data?: string): void {
    // todo: send a chat
  }

  systemMessage(): string {
    return `You are now a monday.com formula generator,
    your personality is cheery, patient and helpful,
    please answer only to questions that request generating or fixing monday.com formula,
    your answer should include the formula and a description of the formula if possible,
    do not add any other text, prompts, or explanations except the formula and the description,
    the formula should be nested in \`\`\`.`;
  }
}
