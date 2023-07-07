import { ErrorCodes } from '@/structures/exceptions/ErrorCodes';

export default {
  [ErrorCodes.UNKNOWN]:
    'Desculpe, ocorreu um erro ao tentar executar este comando. Por favor, tente novamente mais tarde.',
  [ErrorCodes.SOMETHING_WENT_REALLY_WRONG]:
    'Ops... Algo deu muito errado, tente entrar em contato com o desenvolvedor.',
  [ErrorCodes.NOT_IN_VC]:
    'Você deve estar em um canal de voz para usar este comando.',
  [ErrorCodes.NOT_SAME_VC]:
    'Você deve estar no mesmo canal de voz que eu para usar este comando.',
  [ErrorCodes.NO_PLAYER_FOUND]:
    'There is no player in this server, use the `play` command to start playing music.',
  [ErrorCodes.MISSING_PERMISSIONS_JOIN_VC]: 'Eu não tenho permissão para entrar no canal de voz.',
  [ErrorCodes.PLAYER_MISSING_INPUT]: 'Você deve informar o nome da música.',
  [ErrorCodes.MISSING_MESSAGE]: [
    '## Mencione o bot e a música.',
    '### {{- mention}} <link/nome>',
    '',
    'Isso ocorre devido a uma limitação do `Discord`',
    'Para usar este canal você precisa enviar uma mensagem mencionando o bot.',
  ],
};