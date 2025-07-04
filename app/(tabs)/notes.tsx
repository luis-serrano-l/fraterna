import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

// Types for folder and note structure
type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  folderId: string | null;
};

type Folder = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
};

type NavigationState = {
  currentFolderId: string | null;
};

export default function NotesScreen() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentFolderId: null
  });
  
  // Modal states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // Form states
  const [folderName, setFolderName] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
  const theme = useTheme();
  const contentInputRef = useRef<TextInput>(null);

  // --- Add refs for swipeable items ---
  const folderSwipeableRefs = useRef<{ [key: string]: any }>({});
  const noteSwipeableRefs = useRef<{ [key: string]: any }>({});

  // Create dynamic styles based on theme
  const dynamicStyles = useMemo(() => ({
    fab: {
      backgroundColor: theme.colors.tint,
      ...theme.shadows.md,
      borderWidth: 1,
      borderColor: theme.colors.tint,
    },
    actionButton: {
      backgroundColor: '#007AFF',
      borderWidth: 2,
      borderColor: '#007AFF',
      shadowColor: '#007AFF',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 8,
    },
    folderItem: {
      backgroundColor: theme.colors.containerBackgroundActive,
      borderLeftWidth: 4,
      borderLeftColor: '#2196F3',
    },
    noteItem: {
      backgroundColor: theme.colors.containerBackgroundActive,
      borderLeftWidth: 4,
      borderLeftColor: '#9C27B0',
    },
    separator: {
      backgroundColor: theme.colors.separatorSubtle,
    },
    saveButton: {
      backgroundColor: theme.colors.buttonPrimary,
    },
    plusVertical: {
      backgroundColor: theme.colors.background,
    },
    plusHorizontal: {
      backgroundColor: theme.colors.background,
    },
  }), [theme]);

  // Load data on focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [savedFolders, savedNotes] = await Promise.all([
        AsyncStorage.getItem('notes_folders'),
        AsyncStorage.getItem('notes_notes')
      ]);
      
      if (savedFolders) {
        const parsedFolders = JSON.parse(savedFolders).map((folder: any) => ({
          ...folder,
          createdAt: folder.createdAt ? new Date(folder.createdAt) : new Date(),
          updatedAt: folder.updatedAt ? new Date(folder.updatedAt) : new Date(),
        }));
        setFolders(parsedFolders);
      }
      
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
          updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date(),
        }));
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error('Error loading notes data:', error);
      // Set empty arrays as fallback
      setFolders([]);
      setNotes([]);
    }
  };

  // Save data whenever it changes
  useEffect(() => {
    const saveFolders = async () => {
      try {
        await AsyncStorage.setItem('notes_folders', JSON.stringify(folders));
      } catch (error) {
        console.error('Error saving folders:', error);
      }
    };
    saveFolders();
  }, [folders]);

  useEffect(() => {
    const saveNotes = async () => {
      try {
        await AsyncStorage.setItem('notes_notes', JSON.stringify(notes));
      } catch (error) {
        console.error('Error saving notes:', error);
      }
    };
    saveNotes();
  }, [notes]);

  // Get current items based on navigation state
  const currentFolders = useMemo(() => {
    if (navigationState.currentFolderId === null) {
      // Root level - show folders that don't have a parent
      const rootFolders = folders.filter(folder => folder.parentId === null);
      return rootFolders;
    }
    // When inside a folder, show subfolders that have this folder as parent
    const subfolders = folders.filter(folder => folder.parentId === navigationState.currentFolderId);
    return subfolders;
  }, [folders, navigationState.currentFolderId]);

  const currentNotes = useMemo(() => {
    if (navigationState.currentFolderId === null) {
      // Root level - show notes that don't have a folder
      const rootNotes = notes.filter(note => note.folderId === null);
      return rootNotes;
    }
    // Show notes that belong to the current folder
    const folderNotes = notes.filter(note => note.folderId === navigationState.currentFolderId);
    return folderNotes;
  }, [notes, navigationState.currentFolderId]);

  const handleCreateFolder = () => {
    setEditingFolder(null);
    setFolderName('');
    setShowFolderModal(true);
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setNoteContent('');
    setShowNoteModal(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setShowFolderModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setShowNoteModal(true);
  };

  const handleSaveFolder = () => {
    if (!folderName.trim()) return;

    if (editingFolder) {
      // Update existing folder
      const updatedFolder = {
        ...editingFolder,
        name: folderName.trim(),
        updatedAt: new Date(),
      };
      setFolders(folders.map(f => f.id === editingFolder.id ? updatedFolder : f));
    } else {
      // Create new folder
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: folderName.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: navigationState.currentFolderId,
      };
      setFolders([...folders, newFolder]);
    }
    
    setShowFolderModal(false);
    setEditingFolder(null);
    setFolderName('');
  };

  const handleSaveNote = () => {
    if (!noteContent.trim()) return;

    if (editingNote) {
      // Update existing note
      const updatedNote = {
        ...editingNote,
        title: '', // No title field anymore
        content: noteContent.trim(),
        updatedAt: new Date(),
      };
      setNotes(notes.map(n => n.id === editingNote.id ? updatedNote : n));
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: '', // No title field anymore
        content: noteContent.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
        folderId: navigationState.currentFolderId || null,
      };
      setNotes([...notes, newNote]);
    }
    
    setShowNoteModal(false);
    setEditingNote(null);
    setNoteContent('');
  };

  const handleDeleteFolder = (folderId: string) => {
    // Delete the folder and all its subfolders recursively
    const foldersToDelete = new Set<string>();
    const addFolderAndSubfolders = (id: string) => {
      foldersToDelete.add(id);
      folders.forEach(folder => {
        if (folder.parentId === id) {
          addFolderAndSubfolders(folder.id);
        }
      });
    };
    addFolderAndSubfolders(folderId);
    setFolders(folders.filter(f => !foldersToDelete.has(f.id)));
    setNotes(notes.filter(n => !foldersToDelete.has(n.folderId || '')));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  const handleFolderPress = (folder: Folder) => {
    setNavigationState({ currentFolderId: folder.id });
  };

  const getCurrentFolderName = () => {
    if (navigationState.currentFolderId === null) {
      return 'Notes';
    }
    const currentFolder = folders.find(f => f.id === navigationState.currentFolderId);
    return currentFolder?.name || 'Notes';
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerRow}>
                {navigationState.currentFolderId !== null && (
                  <TouchableOpacity
                    style={styles.headerBackButton}
                    onPress={() => {
                      if (navigationState.currentFolderId) {
                        const currentFolder = folders.find(f => f.id === navigationState.currentFolderId);
                        setNavigationState({
                          currentFolderId: currentFolder?.parentId ?? null
                        });
                      }
                    }}
                  >
                    <IconSymbol name="chevron.left" size={20} color={theme.colors.tint} />
                    <ThemedText style={[styles.backButtonText, theme.typography.body]}>Back</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
              {navigationState.currentFolderId !== null && (
                <View style={styles.headerTitleRow}>
                  <ThemedText style={[styles.headerTitle, theme.typography.header]}>
                    {getCurrentFolderName()}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Content list */}
            <View style={styles.listContainer}>
              {currentFolders.length === 0 && currentNotes.length === 0 && (
                <View style={styles.emptyState}>
                  <IconSymbol name="folder" size={48} color={theme.colors.tabIconDefault} />
                  <ThemedText style={[styles.emptyStateText, theme.typography.body]}>
                    {navigationState.currentFolderId === null 
                      ? 'Create your first folder or note to get started!' 
                      : 'This folder is empty.'}
                  </ThemedText>
                </View>
              )}
              <FlatList
                data={[...currentFolders, ...currentNotes]}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => {
                  const isFolder = 'name' in item;
                  let showSeparator = false;
                  if (isFolder && index === currentFolders.length - 1 && currentNotes.length > 0) {
                    // Show separator after the last folder if there are notes
                    showSeparator = true;
                  }
                  return (
                    <>
                      <SwipeableRow
                        item={item}
                        isFolder={isFolder}
                        onDelete={id => {
                          if (isFolder) handleDeleteFolder(id);
                          else handleDeleteNote(id);
                        }}
                        onPress={item => {
                          if (isFolder) handleFolderPress(item);
                          else handleEditNote(item);
                        }}
                        theme={theme}
                        dynamicStyles={dynamicStyles}
                        notes={notes}
                        folders={folders}
                      />
                      {showSeparator && (
                        <View style={[styles.separator, dynamicStyles.separator]} />
                      )}
                    </>
                  );
                }}
                style={styles.list}
              />
            </View>

            {/* Folder Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={showFolderModal}
              onRequestClose={() => setShowFolderModal(false)}
            >
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
              >
                <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setShowFolderModal(false)}
                    >
                      <ThemedText style={[styles.closeButtonText, theme.typography.header]}>✕</ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={[styles.modalTitle, theme.typography.header]}>
                      {editingFolder ? 'Edit Folder' : 'New Folder'}
                    </ThemedText>
                    <TouchableOpacity 
                      style={[styles.saveButton, dynamicStyles.saveButton]} 
                      onPress={handleSaveFolder}
                    >
                      <ThemedText style={[styles.saveButtonText, theme.typography.button]}>Save</ThemedText>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={[
                      styles.modalInput,
                      theme.typography.input,
                      { borderColor: theme.colors.border }
                    ]}
                    value={folderName}
                    onChangeText={setFolderName}
                    placeholder="Folder name"
                    placeholderTextColor={theme.colors.tabIconDefault}
                    autoFocus={true}
                  />
                </View>
              </KeyboardAvoidingView>
            </Modal>

            {/* Note Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={showNoteModal}
              onRequestClose={() => setShowNoteModal(false)}
            >
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContainer}
              >
                <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setShowNoteModal(false)}
                    >
                      <ThemedText style={[styles.closeButtonText, theme.typography.header]}>✕</ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={[styles.modalTitle, theme.typography.header]}>
                      {editingNote ? 'Edit Note' : 'New Note'}
                    </ThemedText>
                    <TouchableOpacity 
                      style={[styles.saveButton, dynamicStyles.saveButton]} 
                      onPress={handleSaveNote}
                    >
                      <ThemedText style={[styles.saveButtonText, theme.typography.button]}>Save</ThemedText>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.noteForm}>
                    <TextInput
                      ref={contentInputRef}
                      style={[
                        styles.modalTextArea,
                        theme.typography.input,
                        { borderColor: theme.colors.border }
                      ]}
                      value={noteContent}
                      onChangeText={setNoteContent}
                      placeholder="Write your note..."
                      placeholderTextColor={theme.colors.tabIconDefault}
                      multiline={true}
                      textAlignVertical="top"
                      autoFocus={true}
                    />
                  </View>
                </View>
              </KeyboardAvoidingView>
            </Modal>

            {/* Floating Action Buttons */}
            <View style={styles.floatingButtons}>
              <TouchableOpacity 
                style={[styles.floatingButton, dynamicStyles.actionButton]} 
                onPress={handleCreateFolder}
              >
                <IconSymbol name="folder.badge.plus" size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.floatingButton, dynamicStyles.actionButton]} 
                onPress={handleCreateNote}
              >
                <IconSymbol name="note.text.badge.plus" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

// --- SwipeableRow component ---
function SwipeableRow({
  item,
  isFolder,
  onDelete,
  onPress,
  theme,
  dynamicStyles,
  notes,
  folders
}: {
  item: any;
  isFolder: boolean;
  onDelete: (id: string) => void;
  onPress: (item: any) => void;
  theme: any;
  dynamicStyles: any;
  notes: Note[];
  folders: Folder[];
}) {
  const id = item.id;
  const translateX = useSharedValue(0);
  const deleteOpacity = useSharedValue(0);

  const resetAnimation = () => {
    translateX.value = withSpring(0);
    deleteOpacity.value = withSpring(0);
  };

  // Show Alert only once per swipe
  const alertShownRef = React.useRef(false);

  const showDeleteAlert = () => {
    if (alertShownRef.current) return;
    alertShownRef.current = true;
    Alert.alert(
      isFolder ? 'Delete Folder' : 'Delete Note',
      isFolder
        ? 'Are you sure you want to delete this folder? All notes and subfolders inside will also be deleted.'
        : 'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            resetAnimation();
            alertShownRef.current = false;
          },
        },
        {
          text: isFolder ? 'Delete' : 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(id);
            alertShownRef.current = false;
          },
        },
      ]
    );
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
      context.startY = 0;
    },
    onActive: (event, context: any) => {
      if (Math.abs(event.translationX) > Math.abs(event.translationY)) {
        const newTranslateX = context.startX + event.translationX;
        translateX.value = Math.min(0, Math.max(-80, newTranslateX));
        if (translateX.value < -40) {
          deleteOpacity.value = withSpring(1);
        } else {
          deleteOpacity.value = withSpring(0);
        }
      }
    },
    onEnd: (event, context: any) => {
      if (
        Math.abs(event.translationX) > Math.abs(event.translationY) &&
        event.translationX < -60
      ) {
        // Show Alert (on JS thread)
        runOnJS(showDeleteAlert)();
        // Do NOT reset animation here; wait for Alert response
      } else {
        translateX.value = withSpring(0);
        deleteOpacity.value = withSpring(0);
        runOnJS(() => {
          alertShownRef.current = false;
        })();
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: deleteOpacity.value,
    };
  });

  return (
    <View style={styles.itemContainer}>
      {/* Delete Button Background */}
      <Animated.View
        style={[
          styles.deleteUnderlay,
          deleteButtonStyle,
          {
            backgroundColor: '#FF3B30',
            position: 'absolute',
            right: 0,
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 0,
            justifyContent: 'flex-end',
            alignItems: 'center',
            flexDirection: 'row',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={showDeleteAlert}
        >
          <IconSymbol name="trash.fill" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-10, 10]}
      >
        <Animated.View
          style={[
            isFolder ? styles.folderItem : styles.noteItem,
            animatedStyle,
            { zIndex: 1 },
          ]}
        >
          {isFolder ? (
            <Pressable
              style={[styles.folderItem, dynamicStyles.folderItem]}
              onPress={() => onPress(item)}
            >
              <View style={styles.itemContent}>
                <IconSymbol name="folder.fill" size={24} color="#2196F3" />
                <View style={styles.itemTextContainer}>
                  <ThemedText style={[styles.itemTitle, theme.typography.body]}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={[styles.itemSubtitle, theme.typography.caption]}>
                    {(() => {
                      // Count notes in this folder and all subfolders
                      const countNotesInFolder = (folderId: string): number => {
                        let count = notes.filter((n) => n.folderId === folderId).length;
                        folders.forEach((subfolder) => {
                          if (subfolder.parentId === folderId) {
                            count += countNotesInFolder(subfolder.id);
                          }
                        });
                        return count;
                      };
                      return countNotesInFolder(item.id);
                    })()} notes
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color="#2196F3" />
              </View>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.noteItem, dynamicStyles.noteItem]}
              onPress={() => onPress(item)}
            >
              <View style={styles.itemContent}>
                <IconSymbol name="doc.text.fill" size={24} color="#9C27B0" />
                <View style={styles.itemTextContainer}>
                  <ThemedText style={[styles.itemTitle, theme.typography.body]}>
                    {item.content.split('\n')[0] || 'Empty Note'}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          )}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 28,
    marginBottom: 0,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 32,
    marginBottom: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    gap: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    // No alignment - let items use their natural width
  },
  itemContainer: {
    marginBottom: 0, // remove extra space between items, separators will handle folder spacing
  },
  folderContainer: {
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  noteContainer: {
    marginBottom: 8,
    width: '100%',
  },
  folderItem: {
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignSelf: 'flex-start',
    minWidth: 200,
    maxWidth: '80%',
  },
  noteItem: {
    padding: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    marginBottom: 2,
  },
  itemSubtitle: {
    opacity: 0.7,
    marginBottom: 2,
  },
  itemDate: {
    opacity: 0.5,
    fontSize: 12,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    // Typography handled by theme
  },
  saveButton: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  saveButtonText: {
    // Typography handled by theme
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  noteForm: {
    flex: 1,
  },
  noteFormContent: {
    paddingBottom: 20,
  },
  modalTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    flexDirection: 'column',
    gap: 12,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteUnderlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  deleteButton: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 