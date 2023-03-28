import { Skeleton, Stack } from "@chakra-ui/react";

interface ISkeletonLoaderProps {
	count: number;
	height: string;
	width: string;
}

const SkeletonLoader: React.FC<ISkeletonLoaderProps> = ({
	count,
	width,
	height,
}) => {
	return (
		<>
			{[...Array(count)].map((_, i) => (
				<Skeleton
					key={i}
					width={width}
					height={height}
					startColor="blackAlpha.400"
					endColor="whiteAlpha.300"
				/>
			))}
		</>
	);
};

export default SkeletonLoader;
