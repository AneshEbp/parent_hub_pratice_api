
## Description

Agora Module

## Installation

Agora module come with initial setup of Ebtheme. If you do not need this module, Follow these steps.

#### Steps

- Remove apps/api/src/modules/agora folder


- Remove folowing code from apps/api/src/app.module.ts
```bash
import { AgoraModule } from './modules/agora/agora.module';

and AgoraModule from import array

and AgoraModule from include array of graphql
```

- Remove libs/common/services/voip/agora folder

- Remove folowing code from apps/api/src/modules/users/users.service.ts

```bash
import { AgoraHelperService } from '@app/common/services/voip/agora/agora.helper';

private readonly agoraHelperService: AgoraHelperService,

if (userUpdate?.agoraUuid && isProfileUpdated) {
        this.agoraHelperService.updateChatUser(userId, {
          nickname: String(userId),
          avatarurl: await this.s3Service.getS3Url(
            `profiles/${userId}/${userUpdate?.profileImage}`,
          ),
          ...(userUpdate?.authProvider === 'email' && {
            mail: userUpdate?.authProviderId,
          }),
        });
      }
if (updatedUser?.agoraUuid && updatedUser?.authProvider === 'email') {
        this.agoraHelperService.updateChatUser(userId, {
          mail: updatedUser?.authProviderId,
        });
      }
      
```


- Remove folowing code from apps/api/src/modules/users/providers.ts
```bash
import { AgoraHelperService } from '@app/common/services/voip/agora/agora.helper';

AgoraHelperService
      
```

- Remove folowing code from apps/api/src/modules/auth/services/phone-otp-auth.service.ts
```bash
import { AgoraHelperService } from '@app/common/services/voip/agora/agora.helper';

private readonly agoraHelperService: AgoraHelperService,

if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );
        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }
      
```

- Remove folowing code from apps/api/src/modules/auth/services/auth.service.ts

```bash
import { AgoraHelperService } from '@app/common/services/voip/agora/agora.helper';

private readonly agoraHelperService: AgoraHelperService,

if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );
        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }

if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );
        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }

if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );
        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }

if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );
        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }

if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );

        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }

if (!user?.agoraUuid) {
        const chatUserUuid = await this.agoraHelperService.getChatUserUuid(
          String(user._id),
          user?.authProviderId,
        );
        if (chatUserUuid) {
          await this.userRepository.updateById(user._id, {
            agoraUuid: chatUserUuid,
          });
        }
      }

```
- Remove folowing code from apps/api/src/modules/auth/providers.ts
```bash
import { AgoraHelperService } from '@app/common/services/voip/agora/agora.helper';

AgoraHelperService
      
```

### Methods
- createAgoraToken
- initiateAgoraCall
- createAgoraChatUserToken
- sendVOIPNotification