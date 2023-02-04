export const EmbedLimits = {
  /**
   * Maximum characters allowed in the author field of an embed.
   */
  MaximumAuthorNameLength: 256,
  /**
   * Maximum characters allowed in an embed description.
   */
  MaximumDescriptionLength: 4096,
  /**
   * Maximum characters allowed in the name of a field in an embed.
   */
  MaximumFieldNameLength: 256,
  /**
   * Maximum fields allowed in an embed.
   */
  MaximumFields: 25,
  /**
   * Maximum characters allowed in the value of a field in an embed.
   */
  MaximumFieldValueLength: 1024,
  /**
   * Maximum characters allowed in a footer of an embed.
   */
  MaximumFooterLength: 2048,
  /**
   * Maximum characters allowed in the title of an embed.
   */
  MaximumTitleLength: 256,
  /**
   * Maximum characters allowed in an embed, in total.
   */
  MaximumTotalCharacters: 6000,
};

export const SelectMenuLimits = {
  /**
   * Maximum characters allowed in a select menu custom ID.
   */
  MaximumCustomIdCharacters: 100,
  /**
   * Maximum amount of options allowed in a select menu.
   */
  MaximumOptionsLength: 25,
  /**
   * Maximum characters allowed in a select menu placeholder.
   */
  MaximumPlaceholderCharacters: 150,
  /**
   * Maximum "minimum" values allowed in a select menu.
   */
  MaximumMinValuesSize: 25,
  /**
   * Maximum "maximum" values allowed in a select menu.
   */
  MaximumMaxValuesSize: 25,
  /**
   * Maximum characters allowed in a select menu option's name.
   */
  MaximumLengthOfNameOfOption: 100
} as const;