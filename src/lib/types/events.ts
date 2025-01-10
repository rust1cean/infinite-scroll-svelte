export type InfiniteScrollEvents = {
	// IMPORTANT
	/**
	 * The scroll event will be blocked
	 * until one of the methods is executed.
	 */
	onPrevChunk?: () => Promise<any>;
	onNextChunk?: () => Promise<any>;
	// IMPORTANT

	onError?: (error: Error) => any;
	onFinally?: () => any;
};

export type InfiniteScrollScrollBars = {
	scrollX?: boolean;
	scrollY?: boolean;
};

export type InfiniteScrollThreshold = {
	thresholdPrev?: number;
	thresholdNext?: number;
};
