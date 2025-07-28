
export const NoFlags = /*                      */ 0b00000000000000000000000000;

export const Placement = /*                    */ 0b00000000000000000000000010;
export const Update = /*                       */ 0b00000000000000000000000100;
export const Deletion = /*                     */ 0b00000000000000000000001000;
export const ContentReset = /*                 */ 0b00000000000000000000100000;
export const Ref = /*                          */ 0b00000000000000001000000000;
export const Callback = /*                     */ 0b00000000000000000001000000;
export const DidCapture = /*                   */ 0b00000000000000000010000000;
export const Forked = /*                       */ 0b00000100000000000000000000;

// Union of all commit flags (flags with the lifetime of a particular commit)
export const HostEffectMask = /*               */ 0b00000000000111111111111111;

export const Incomplete = /*                   */ 0b00000000001000000000000000;
export const ShouldCapture = /*                */ 0b00000000010000000000000000;

export const MutationMask = Placement | Update |  ContentReset | Ref;
export const LayoutMask = Update | Callback | Ref;