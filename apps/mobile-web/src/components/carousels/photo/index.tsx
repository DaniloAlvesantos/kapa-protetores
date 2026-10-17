import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
} from 'react-native';
import { CaretLeftIcon, CaretRightIcon } from 'phosphor-react-native';
import { colors } from '@/theme/colors';

export interface CarouselPhoto {
  id: string;
  photoUrl: string;
}

export interface PhotoCarouselProps {
  photos: CarouselPhoto[];
  height?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  dots?: boolean;
}

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 50,
};

export function PhotoCarousel({
  photos,
  height = 320,
  autoPlay = false,
  autoPlayInterval = 4000,
  dots = false,
}: PhotoCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const flatListRef = useRef<FlatList<CarouselPhoto>>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const slideWidth =
    containerWidth > 0 ? containerWidth : Math.max(windowWidth - 40, 1);
  const safeActiveIndex =
    photos.length > 0 ? Math.min(activeIndex, photos.length - 1) : 0;

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) {
      setContainerWidth((prev) => (prev !== width ? width : prev));
    }
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= photos.length || slideWidth <= 0) return;

      setActiveIndex(index);
      flatListRef.current?.scrollToOffset({
        offset: index * slideWidth,
        animated: true,
      });
    },
    [photos.length, slideWidth],
  );

  useEffect(() => {
    if (autoPlay && !isDragging && photos.length > 1 && slideWidth > 0) {
      intervalRef.current = setInterval(() => {
        const nextIndex = (safeActiveIndex + 1) % photos.length;
        scrollToIndex(nextIndex);
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    autoPlay,
    isDragging,
    safeActiveIndex,
    photos.length,
    slideWidth,
    autoPlayInterval,
    scrollToIndex,
  ]);

  const updateIndexFromOffset = useCallback(
    (offsetX: number) => {
      if (slideWidth <= 0) return;
      const nextIndex = Math.round(offsetX / slideWidth);
      if (nextIndex >= 0 && nextIndex < photos.length) {
        setActiveIndex((prev) => (prev !== nextIndex ? nextIndex : prev));
      }
    },
    [photos.length, slideWidth],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      updateIndexFromOffset(event.nativeEvent.contentOffset.x);
    },
    [updateIndexFromOffset],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setIsDragging(false);
      updateIndexFromOffset(event.nativeEvent.contentOffset.x);
    },
    [updateIndexFromOffset],
  );

  const handleScrollBeginDrag = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setIsDragging(false);
      const targetOffsetX =
        event.nativeEvent.targetContentOffset?.x ??
        event.nativeEvent.contentOffset.x;
      updateIndexFromOffset(targetOffsetX);
    },
    [updateIndexFromOffset],
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<CarouselPhoto>[] }) => {
      const firstVisible = viewableItems[0];
      if (firstVisible && typeof firstVisible.index === 'number') {
        setActiveIndex(firstVisible.index);
      }
    },
    [],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CarouselPhoto>) => (
      <Image
        source={{ uri: item.photoUrl }}
        style={{
          width: slideWidth,
          height,
        }}
        resizeMode="cover"
        accessibilityLabel="Foto do animal"
      />
    ),
    [slideWidth, height],
  );

  if (photos.length === 0) {
    return null;
  }

  return (
    <View
      onLayout={handleLayout}
      className="relative w-full overflow-hidden bg-peach"
      style={{ height }}
    >
      <FlatList
        ref={flatListRef}
        data={photos}
        keyExtractor={(item: CarouselPhoto) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={handleViewableItemsChanged}
        getItemLayout={(
          _: ArrayLike<CarouselPhoto> | null | undefined,
          index: number,
        ) => ({
          length: slideWidth,
          offset: slideWidth * index,
          index,
        })}
        renderItem={renderItem}
      />

      {photos.length > 1 && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Foto anterior"
            disabled={safeActiveIndex === 0}
            onPress={() => scrollToIndex(safeActiveIndex - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/85"
            style={{ opacity: safeActiveIndex === 0 ? 0.4 : 1 }}
          >
            <CaretLeftIcon size={20} color={colors.secondary} weight="bold" />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Próxima foto"
            disabled={safeActiveIndex === photos.length - 1}
            onPress={() => scrollToIndex(safeActiveIndex + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/85"
            style={{ opacity: safeActiveIndex === photos.length - 1 ? 0.4 : 1 }}
          >
            <CaretRightIcon size={20} color={colors.secondary} weight="bold" />
          </Pressable>

          <View
            className={`absolute bottom-3 ${dots ? 'left-0 right-0' : 'right-4'} flex-row items-center justify-center gap-2`}
          >
            {dots ? (
              photos.map((photo, index) => {
                const isActive = index === safeActiveIndex;
                return (
                  <Pressable
                    key={photo.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Ir para foto ${index + 1}`}
                    onPress={() => scrollToIndex(index)}
                    hitSlop={8}
                    className="h-2.5 rounded-full"
                    style={{
                      width: isActive ? 20 : 10,
                      backgroundColor: isActive ? colors.primary : colors.card,
                    }}
                  />
                );
              })
            ) : (
              <View className="rounded bg-gray-500/25 backdrop-blur-md px-2 py-1">
                <Text className="font-body text-xs font-semibold text-white">
                  {activeIndex + 1}/{photos.length}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}
